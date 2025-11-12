import db from "../config/database.config.js";


export async function isInCategory(name) {
    if (!name) return null;
    const row = await db("category")
    .select("id_category")
    .where("name_category", name)
    .first();
    return row?.id_category ?? null;  
}

export async function insertCategory(name_category, parent) {
  const name = name_category?.trim();
  if (!name) return null;

  const [row] = await db("category")
    .insert({ name_category: name, id_parent_category: parent })
    .onConflict("name_category")
    .merge()    
    .returning(["id_category"]);
}

export const getAllCategory = (filter = {}) => {
    const query = db("category").select("*");
    if (filter.keyword) {
        query.where("name_category", "like", `%${filter.keyword}%`);
    }
    if (filter.page && filter.limit) {
        const offset = (filter.page - 1) * filter.limit;
        query.offset(offset).limit(filter.limit);
    }
    return query;
};