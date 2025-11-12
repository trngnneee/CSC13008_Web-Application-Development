import db from "../config/database.config.js";
import { mapCsvRecordToDbProduct, chunkArray } from "../helper/normalize.helper.js";

export async function insertListProducts(records, chunkSize = 500) {
  if (!Array.isArray(records)) {
    throw new TypeError("insertListProducts(records): records must be an array");
  }

  const prepared = records.map((r) =>
    mapCsvRecordToDbProduct({
      ...r,
      url_img: Array.isArray(r.url_img) && r.url_img.length === 0 ? null : r.url_img,
    })
  );

  let inserted = 0;
  const errors = [];

  const chunks = chunkArray(prepared, chunkSize);

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    if (!chunk.length) continue;

    await db.transaction(async (trx) => {
      try {
        // insert
        await trx("product").insert(chunk);
        inserted += chunk.length;
      } catch (e) {
        // Lỗi cấp chunk
        const base = c * chunkSize;
        errors.push({
          indexFrom: base,
          indexTo: base + chunk.length - 1,
          message: e?.message || "Insert chunk failed",
          code: e?.code,
          detail: e?.detail,
          constraint: e?.constraint,
        });
        for (let j = 0; j < chunk.length; j++) {
          try {
            await trx.transaction(async (subTrx) => {
              await subTrx("product").insert(chunk[j]); 
              inserted += 1;
            });
          } catch (e1) {
            errors.push({
              indexFrom: base + j,
              indexTo: base + j,
              message: e1?.message || "Insert row failed",
              code: e1?.code,
              detail: e1?.detail,
              constraint: e1?.constraint,
              rowPreview: { name: chunk[j]?.name, name_category: chunk[j]?.name_category },
            });
          }
        }
      }
    });
  }

  return {
    total: records.length,
    inserted,
    failed: records.length - inserted,
    errors,
    skipped_empty: 0,
  };
}
