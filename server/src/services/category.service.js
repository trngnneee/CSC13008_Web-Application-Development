import db from '../config/database.js';
import slugify from 'slugify';

export const isInCategory = async (name) => {
  if (!name) return null;
  const row = await db('category')
    .select('id_category')
    .where('name_category', name)
    .first();
  return row?.id_category ?? null;
};

export const insertCategory = async (name_category, parent) => {
  const name = name_category?.trim();
  if (!name) return null;

  const [row] = await db('category')
    .insert({ name_category: name, id_parent_category: parent })
    .onConflict('name_category')
    .merge()
    .returning(['id_category']);
  return row;
};

export const getAllCategory = (filter = {}) => {
  const query = db('category')
    .select('*')
    .where(function () {
      this.where('is_deleted', false).orWhereNull('is_deleted');
    });

  if (filter.keyword) {
    query.whereRaw(
      "fts @@ to_tsquery('english', remove_accents(?) || ':*')",
      [filter.keyword]
    );
  }

  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }

  return query;
};

export const getCategoryName = async (id, trx = null) => {
  const kx = trx || db;
  const row = await kx('category').select('name_category').where('id_category', id).first();
  return row?.name_category || null;
};

export const getCategoryDetail = async (id) => {
  const category = await db('category').where('id_category', id).first();
  if (!category) return null;

  let parentName = null;
  if (category.id_parent_category) {
    const parent = await db('category').where('id_category', category.id_parent_category).first();
    parentName = parent?.name_category || null;
  }

  return {
    id_category: category.id_category,
    name_category: category.name_category,
    id_parent_category: category.id_parent_category,
    parent_name: parentName,
  };
};

export const updateCategory = async (id, { name_category, id_parent_category }) => {
  const category = await db('category').where('id_category', id).first();
  if (!category) return null;

  const updateData = {};
  if (name_category !== undefined && name_category !== null) {
    updateData.name_category = name_category.trim();
  }
  if (id_parent_category !== undefined) {
    updateData.id_parent_category = id_parent_category;
  }

  if (Object.keys(updateData).length === 0) return category;

  const [updatedCategory] = await db('category')
    .where('id_category', id)
    .update(updateData)
    .returning('*');

  return updatedCategory;
};

export const deleteCategory = async (id) => {
  const category = await db('category').where('id_category', id).first();
  if (!category) return null;

  await db('category').where('id_category', id).update({ is_deleted: true });
  return category;
};

const deleteCategoryID = async (id, trx = null) => {
  const kx = trx || db;
  return kx('category').where('id_category', id).update({ is_deleted: true });
};

export const getDescendantCategoryIds = async (rootId, trx = null) => {
  const kx = trx || db;
  const toVisit = [rootId];
  const seen = new Set();
  const allIds = [];

  while (toVisit.length) {
    const cur = toVisit.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    allIds.push(cur);

    const rows = await kx('category').select('id_category').where('id_parent_category', cur);
    for (const r of rows) toVisit.push(r.id_category);
  }

  return allIds;
};

export const deleteCategoryTree = async (id) => {
  const { deleteProductByCategoryId } = await import('./product.service.js');

  const rootName = await getCategoryName(id);
  if (!rootName) return null;

  let deletedProducts = 0;
  let deletedCategories = 0;

  await db.transaction(async (trx) => {
    const allIds = await getDescendantCategoryIds(id, trx);

    for (const catId of allIds) {
      deletedProducts += await deleteProductByCategoryId(catId, trx);
    }
    for (const catId of allIds) {
      deletedCategories += await deleteCategoryID(catId, trx);
    }
  });

  return { rootName, deletedProducts, deletedCategories };
};

export const isCatHasProducts = async (id) => {
  const product = await db('product').select('id_product').where('id_category', id).first();
  return !!product;
};

export const getAllChildCategoryIDs = async (rootId) => {
  return getDescendantCategoryIds(rootId);
};

export const buildCategoryTree = (categories) => {
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id_category] = { ...cat, children: [] };
  });

  const roots = [];
  categories.forEach((cat) => {
    const parentId = cat.id_parent_category;
    if (parentId && categoryMap[parentId]) {
      categoryMap[parentId].children.push(categoryMap[cat.id_category]);
    } else {
      roots.push(categoryMap[cat.id_category]);
    }
  });

  return roots;
};
