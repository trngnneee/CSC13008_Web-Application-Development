import { parse } from "csv-parse/sync";
import * as CategoryService from "../service/category.service.js";

export const PRODUCT_FIELDS = [
  "name_category",
  "avatar",
  "name",
  "price",
  "immediate_purchase_price",
  "posted_date_time",
  "end_date_time",
  "description",
  "judge_point",
  "pricing_step",
  "starting_price",
  "url_img",
];

const normalize = (s) => s.trim().toLowerCase().replace(/\s+|-/g, "_");

const toNumber = (v) => {
  if (v == null) return null;
  const s = String(v).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const parseDateFlexible = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  // ISO / RFC
  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1.toISOString();

  // dd/mm/yyyy HH:MM(:SS) | dd-mm-yyyy
  const m = s.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, dd, mm, yyyy, HH = "00", MM = "00", SS = "00"] = m;
    const iso = `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
      2,
      "0"
    )}T${String(HH).padStart(2, "0")}:${String(MM).padStart(
      2,
      "0"
    )}:${String(SS).padStart(2, "0")}Z`;
    const d2 = new Date(iso);
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }

  // timestamp (ms/s)
  if (/^\d{10,13}$/.test(s)) {
    const ts = s.length === 13 ? Number(s) : Number(s) * 1000;
    const d3 = new Date(ts);
    if (!isNaN(d3.getTime())) return d3.toISOString();
  }
  return null;
};

const parseUrlArray = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  // JSON array
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        const cleaned = arr.map((x) => String(x).trim()).filter(Boolean);
        return cleaned.length ? cleaned : null;
      }
    } catch { /* ignore */ }
  }

  // Fallback: tách theo , ; |
  const parts = s.split(/[;,|]/).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : null;
};

const convertField = async (field, raw) => {
  const v = raw == null ? null : String(raw).trim();
  switch (field) {
    case "name_category": {
      if (!v) return null;
      let catId = await CategoryService.isInCategory(v);
      if (!catId) {
        catId = await CategoryService.insertCategory(v, null);
      }
      return v;
    }
    case "avatar": return v || null;
    case "name": return v || null;
    case "price": return toNumber(v);
    case "immediate_purchase_price": return toNumber(v);
    case "posted_date_time": return parseDateFlexible(v);
    case "end_date_time": return parseDateFlexible(v);
    case "description": return v || null;
    case "judge_point": return toNumber(v);
    case "pricing_step": return toNumber(v);
    case "starting_price": return toNumber(v);
    case "url_img": return parseUrlArray(v);
    default: return null;
  }
};

export async function parseProductsCsv(buffer) {
  const text = buffer.toString("utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  if (rows.length === 0) {
    return { records: [], unknownColumns: [], missingColumns: PRODUCT_FIELDS };
  }

  // map header CSV -> field chuẩn
  const csvHeaders = Object.keys(rows[0]).map((h) => h.trim());
  const headerMap = {};
  for (const h of csvHeaders) {
    const norm = normalize(h);
    const match = PRODUCT_FIELDS.find((f) => normalize(f) === norm) ?? null;
    headerMap[h] = match; // null = cột thừa
  }

  const unknownColumns = csvHeaders.filter((h) => headerMap[h] === null);
  const present = new Set(Object.values(headerMap).filter(Boolean));
  const missingColumns = PRODUCT_FIELDS.filter((f) => !present.has(f));

  // records đầy đủ field; thiếu -> null (convertField là async)
  const records = await Promise.all(
    rows.map(async (row) => {
      const obj = {};
      for (const f of PRODUCT_FIELDS) {
        const sourceHeader = Object.keys(headerMap).find((h) => headerMap[h] === f);
        const raw = sourceHeader ? row[sourceHeader] ?? null : null;
        obj[f] = await convertField(f, raw);
      }
      return obj;
    })
  );

  return { records, unknownColumns, missingColumns };
}
