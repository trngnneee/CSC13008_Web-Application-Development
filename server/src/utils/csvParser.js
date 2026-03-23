import { parse } from 'csv-parse/sync';
import * as categoryService from '../services/category.service.js';

export const PRODUCT_FIELDS = [
  'id_category',
  'avatar',
  'name',
  'price',
  'immediate_purchase_price',
  'posted_date_time',
  'end_date_time',
  'description',
  'judge_point',
  'pricing_step',
  'starting_price',
  'url_img',
];

const normalizeHeader = (s) => s.trim().toLowerCase().replace(/\s+|-/g, '_');

const toNumber = (v) => {
  if (v == null) return null;
  const s = String(v).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const parseDateFlexible = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1.toISOString();

  const m = s.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, dd, mm, yyyy, HH = '00', MM = '00', SS = '00'] = m;
    const iso = `${yyyy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${String(HH).padStart(2, '0')}:${String(MM).padStart(2, '0')}:${String(SS).padStart(2, '0')}Z`;
    const d2 = new Date(iso);
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }

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

  if (s.startsWith('[') && s.endsWith(']')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        const cleaned = arr.map((x) => String(x).trim()).filter(Boolean);
        return cleaned.length ? cleaned : null;
      }
    } catch {
      /* ignore */
    }
  }

  const parts = s
    .split(/[;,|]/)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
};

const convertField = async (field, raw) => {
  const v = raw == null ? null : String(raw).trim();
  switch (field) {
    case 'id_category': {
      if (!v) return null;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
        return v;
      }
      let catId = await categoryService.isInCategory(v);
      if (!catId) {
        await categoryService.insertCategory(v, null);
        catId = await categoryService.isInCategory(v);
      }
      return catId;
    }
    case 'avatar':
      return v || null;
    case 'name':
      return v || null;
    case 'price':
      return toNumber(v);
    case 'immediate_purchase_price':
      return toNumber(v);
    case 'posted_date_time':
      return parseDateFlexible(v);
    case 'end_date_time':
      return parseDateFlexible(v);
    case 'description':
      return v || null;
    case 'judge_point':
      return toNumber(v);
    case 'pricing_step':
      return toNumber(v);
    case 'starting_price':
      return toNumber(v);
    case 'url_img':
      return parseUrlArray(v);
    default:
      return null;
  }
};

export async function parseProductsCsv(buffer) {
  const text = buffer.toString('utf8');
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  if (rows.length === 0) {
    return { records: [], unknownColumns: [], missingColumns: PRODUCT_FIELDS };
  }

  const csvHeaders = Object.keys(rows[0]).map((h) => h.trim());
  const headerMap = {};
  for (const h of csvHeaders) {
    const norm = normalizeHeader(h);
    const match = PRODUCT_FIELDS.find((f) => normalizeHeader(f) === norm) ?? null;
    headerMap[h] = match;
  }

  const unknownColumns = csvHeaders.filter((h) => headerMap[h] === null);
  const present = new Set(Object.values(headerMap).filter(Boolean));
  const missingColumns = PRODUCT_FIELDS.filter((f) => !present.has(f));

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
