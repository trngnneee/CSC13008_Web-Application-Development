export const URL_IMG_MODE = "pg_array";

export function normalizeUrlImg(v) {
  let arr = null;

  if (Array.isArray(v)) {
    arr = v.map((x) => String(x).trim()).filter(Boolean);
  } else if (typeof v === "string" && v.trim()) {
    const s = v.trim();
    if (s.startsWith("[") && s.endsWith("]")) {
        const tmp = JSON.parse(s);
        if (Array.isArray(tmp)) arr = tmp.map((x) => String(x).trim()).filter(Boolean);
      
    }
    if (!arr) arr = [s];
  }

  if (!arr || arr.length === 0) return null;

  if (URL_IMG_MODE === "pg_array") return arr;            
  return null;
}

export function mapCsvRecordToDbProduct(r) {
  return {
    id_category: r.id_category ?? null,  
    avatar: r.avatar ?? null,
    name: r.name ?? null,
    price: r.price ?? null,
    immediate_purchase_price: r.immediate_purchase_price ?? null,
    posted_date_time: r.posted_date_time ?? null, 
    end_date_time: r.end_date_time ?? null,
    description: r.description ?? null,
    judge_point: r.judge_point ?? null,
    pricing_step: r.pricing_step ?? null,
    starting_price: r.starting_price ?? null,
    url_img: normalizeUrlImg(r.url_img),
  };
}

export function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}