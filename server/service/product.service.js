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
              rowPreview: { name: chunk[j]?.name, id_category: chunk[j]?.id_category },
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

export const deleteProductID = async (id) => {
    const product = await db("product")
        .where("id_product", id)
        .first();

    if (!product) return null;

    await db("product")
        .where("id_product", id)
        .del();

    return product; 
}

export const deleteProductList = async (ids, trx = null) => {
    const kx = trx ? trx : db;
    return kx("product").whereIn("id_product", ids).del();
}

export const deleteProductByCategoryName = async (categoryName, trx = null) => {
  const kx = trx ? trx : db;
  return kx("product").where("name_category", categoryName).del();
}

export const deleteProductByCategoryId = async (categoryId, trx = null) => {
  const kx = trx ? trx : db;
  return kx("product").where("id_category", categoryId).del();
}

export const insertProduct = async (productData) => {
  const dbProduct = mapCsvRecordToDbProduct(productData);

  try {
    const [newProduct] = await db("product")
      .insert(dbProduct)
      .returning(["id_product", "name"]);

    return newProduct;
  } catch (e) {
    throw e;
  }
};

export const getAllProducts = async (filter = {}) => {
    const query = db("product").select("*");
    if (filter.keyword) {
        const regex = new RegExp(filter.keyword, "i");
        query.whereRaw("slug ~* ?", [regex.source]);
    }
    if (filter.page && filter.limit) {
        const offset = (filter.page - 1) * filter.limit;
        query.offset(offset).limit(filter.limit);
    }
    return query;
}

export const getProduct = async (id) => {
    return db("product")
        .where("id_product", id)
        .first();
}

export const updateProduct = async (id, productData) => {
  const product = await db("product").where("id_product", id).first();
  if (!product) return null;

  const updateData = {};
  
  if (productData.name !== undefined) updateData.name = productData.name;
  if (productData.id_category !== undefined) updateData.id_category = productData.id_category;
  if (productData.avatar !== undefined) updateData.avatar = productData.avatar;
  if (productData.price !== undefined) updateData.price = productData.price;
  if (productData.immediate_purchase_price !== undefined) updateData.immediate_purchase_price = productData.immediate_purchase_price;
  if (productData.posted_date_time !== undefined) updateData.posted_date_time = productData.posted_date_time;
  if (productData.end_date_time !== undefined) updateData.end_date_time = productData.end_date_time;
  if (productData.description !== undefined) updateData.description = productData.description;
  if (productData.judge_point !== undefined) updateData.judge_point = productData.judge_point;
  if (productData.pricing_step !== undefined) updateData.pricing_step = productData.pricing_step;
  if (productData.starting_price !== undefined) updateData.starting_price = productData.starting_price;
  if (productData.url_img !== undefined) updateData.url_img = productData.url_img;

  if (Object.keys(updateData).length === 0) {
    return product;
  }

  const [updatedProduct] = await db("product")
    .where("id_product", id)
    .update(updateData)
    .returning("*");

  return updatedProduct;
}

export const getProductsByCategory = async (id_category, filter = {}) => {
  const query = db("product").where("id_category", id_category);

  if (filter.keyword) {
    query.where("name", "like", `%${filter.keyword}%`);
  }

  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }

  return query;
}