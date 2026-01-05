import express from "express";
import db from "../../config/database.config.js";

const router = express.Router();

// Số phút để xác định sản phẩm mới
const NEW_PRODUCT_MINUTES = 30;

router.get("/", async (req, res) => {
  const keyword = req.query.keyword;
  const status = req.query.status || "";

  let filter = {};
  if (status === "price-asc") {
    filter = { orderBy: { price: "asc" } };
  } else if (status === "price-desc") {
    filter = { orderBy: { price: "desc" } };
  } else if (status === "end-asc") {
    filter = { orderBy: { end_date_time: "asc" } };
  } else if (status === "end-desc") {
    filter = { orderBy: { end_date_time: "desc" } };
  }

  const productList = await db('product')
    .select(
      'product.*',
      db.raw(`CASE WHEN posted_date_time > NOW() - INTERVAL '${NEW_PRODUCT_MINUTES} minutes' THEN true ELSE false END as is_new`)
    )
    .whereRaw(
      "fts @@ plainto_tsquery('english', remove_accents(?) || ':*')",
      [keyword]
    )
    .where(function() {
      this.where('product.status', '!=', 'inactive').orWhereNull('product.status');
    })
    .modify((qb) => {
      if (filter.orderBy) {
        qb.orderBy(Object.keys(filter.orderBy)[0], Object.values(filter.orderBy)[0]);
      }
    });

  res.json({
    code: "success",
    message: "Search results fetched successfully",
    productList: productList,
    newProductMinutes: NEW_PRODUCT_MINUTES
  })
})

export default router;