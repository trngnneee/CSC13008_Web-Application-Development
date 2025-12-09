import db from "../config/database.config.js";

export const buildCategoryTree = (categories) => {
  const categoryMap = {};

  // Tạo map
  categories.forEach(cat => {
    categoryMap[cat.id_category] = { ...cat, children: [] };
  });

  const roots = [];

  categories.forEach(cat => {
    const parentId = cat.id_parent_category;

    if (parentId && categoryMap[parentId]) {
      // Gán vào children
      categoryMap[parentId].children.push(categoryMap[cat.id_category]);
    } else {
      // Không có parent → root
      roots.push(categoryMap[cat.id_category]);
    }
  });

  return roots;
};

/**
 * Lấy tất cả id category con (bao gồm category_id gốc)
 * @param {number|string} categoryId
 * @returns {Promise<number[]>}
 */
export const getAllChildCategoryIDs = async (categoryId) => {
  const query = `
    WITH RECURSIVE category_tree AS (
      SELECT id_category
      FROM category
      WHERE id_category = ?

      UNION ALL

      SELECT c.id_category
      FROM category c
      INNER JOIN category_tree ct ON c.id_parent_category = ct.id_category
    )
    SELECT id_category FROM category_tree;
  `;

  const result = await db.raw(query, [categoryId]);
  return result.rows.map(row => row.id_category);
};
