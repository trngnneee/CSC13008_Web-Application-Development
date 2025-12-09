import express from "express";
import db from "../../config/database.config.js";

const router = express.Router();

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

  const productList = await db('product').whereRaw(
    "fts @@ plainto_tsquery('english', remove_accents(?) || ':*')",
    [keyword]
  ).modify((qb) => {
    if (filter.orderBy) {
      qb.orderBy(Object.keys(filter.orderBy)[0], Object.values(filter.orderBy)[0]);
    }
  });

  res.json({
    code: "success",
    message: "Search results fetched successfully",
    productList: productList
  })
})

export default router;