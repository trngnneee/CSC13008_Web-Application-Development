import db from '../config/database.js';
import { mapCsvRecordToDbProduct, chunkArray } from '../utils/normalize.js';

export const insertListProducts = async (records, chunkSize = 500) => {
  if (!Array.isArray(records)) {
    throw new TypeError('insertListProducts(records): records must be an array');
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
        await trx('product').insert(chunk);
        inserted += chunk.length;
      } catch (e) {
        const base = c * chunkSize;
        errors.push({
          indexFrom: base,
          indexTo: base + chunk.length - 1,
          message: e?.message || 'Insert chunk failed',
          code: e?.code,
          detail: e?.detail,
          constraint: e?.constraint,
        });
        for (let j = 0; j < chunk.length; j++) {
          try {
            await trx.transaction(async (subTrx) => {
              await subTrx('product').insert(chunk[j]);
              inserted += 1;
            });
          } catch (e1) {
            errors.push({
              indexFrom: base + j,
              indexTo: base + j,
              message: e1?.message || 'Insert row failed',
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

  return { total: records.length, inserted, failed: records.length - inserted, errors, skipped_empty: 0 };
};

export const deleteProductID = async (id) => {
  return db('product').where('id_product', id).update({ status: 'inactive' });
};

export const deleteProductList = async (ids, trx = null) => {
  const kx = trx || db;
  return kx('product').whereIn('id_product', ids).update({ status: 'inactive' });
};

export const deleteProductByCategoryId = async (categoryId, trx = null) => {
  const kx = trx || db;
  return kx('product').where('id_category', categoryId).update({ status: 'inactive' });
};

export const insertProduct = async (productData) => {
  const dbProduct = mapCsvRecordToDbProduct(productData);
  const [newProduct] = await db('product').insert(dbProduct).returning(['id_product', 'name']);
  return newProduct;
};

export const getAllProducts = async (filter = {}) => {
  const query = db('product')
    .select('*')
    .where('status', 'active')
    .where('end_date_time', '>', db.fn.now());

  if (filter.keyword) {
    query.whereRaw("fts @@ to_tsquery('english', remove_accents(?) || ':*')", [filter.keyword]);
  }
  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }
  if (filter.limitItem) {
    query.limit(filter.limitItem);
  }
  return query;
};

export const getProduct = async (id) => {
  return db('product').where('id_product', id).first();
};

export const getProductsByIds = async (ids) => {
  return db('product').whereIn('id_product', ids).select('*');
};

export const updateProduct = async (id, productData) => {
  const product = await db('product').where('id_product', id).first();
  if (!product) return null;

  const allowedFields = [
    'name', 'id_category', 'avatar', 'price', 'immediate_purchase_price',
    'posted_date_time', 'end_date_time', 'description', 'judge_point',
    'pricing_step', 'starting_price', 'url_img', 'updated_by',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (productData[field] !== undefined) updateData[field] = productData[field];
  }

  if (Object.keys(updateData).length === 0) return product;

  const [updatedProduct] = await db('product')
    .where('id_product', id)
    .update(updateData)
    .returning('*');

  return updatedProduct;
};

export const getProductsByCategory = async (id_category, filter = {}) => {
  const query = db('product')
    .where('id_category', id_category)
    .where('status', 'active')
    .where('end_date_time', '>', db.fn.now());

  if (filter.keyword) {
    query.where('name', 'like', `%${filter.keyword}%`);
  }
  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }
  return query;
};

export const addTimeToAllProducts = async (extend_threshold_minutes, extend_duration_minutes) => {
  const threshold = Number(extend_threshold_minutes);
  const duration = Number(extend_duration_minutes);

  const existing = await db('auction_settings').first();

  if (existing) {
    const [row] = await db('auction_settings')
      .update({ extend_threshold_minutes: threshold, extend_duration_minutes: duration })
      .returning('*');
    return row;
  }

  const [row] = await db('auction_settings')
    .insert({ extend_threshold_minutes: threshold, extend_duration_minutes: duration })
    .returning('*');
  return row;
};

export const getAutoExtendSettings = async () => {
  const settings = await db('auction_settings').first();
  return settings || { extend_threshold_minutes: null, extend_duration_minutes: null };
};
