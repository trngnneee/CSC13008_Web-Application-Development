import express from "express";
import db from "../../config/database.config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const keyword = req.query.keyword;

  const productList = await db('product').whereRaw(
    "fts @@ plainto_tsquery('english', remove_accents(?) || ':*')",
    [keyword]
  );

  res.json({
    code: "success",
    message: "Search results fetched successfully",
    productList: productList
  })
})

export default router;