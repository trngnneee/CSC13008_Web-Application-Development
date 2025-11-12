import db from "../config/database.config.js";

export async function insertProducts(records, chunkSize = 500) {
    const prepared = records.map(r => {
        if (Array.isArray(r.url_img) && r.url_img.length === 0) {
            return { ...r, url_img: null };
        }
        return r;
    });

    let inserted = 0;
    for (let i = 0; i < prepared.length; i += chunkSize) {
        const chunk = prepared.slice(i, i + chunkSize);
        if (!chunk.length) continue;

        await db("product").insert(chunk);
        inserted += chunk.length;
    }

    return {
        total: records.length,
        inserted,
        failed: 0,
        errors: [],
        skipped_empty: 0,
    };
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

export const addSingleCategory = (name, parent) => {
    return db("category").insert({
        name_category: name,
        id_parent_category: parent
    });
}
