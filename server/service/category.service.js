import db from "../config/database.config.js";


export async function isInCategory(name) {
    if (!name) return null;
    const row = await db("category")
    .select("id_category")
    .where("name_category", name)
    .first();
    return row?.id_category ?? null;  
}

export async function insertCategory(name_category) {
  const name = name_category?.trim();
  if (!name) return null;

  const [row] = await db("category")
    .insert({ name_category: name })
    .onConflict("name_category")
    .merge()    
    .returning(["id_category"]);
}
