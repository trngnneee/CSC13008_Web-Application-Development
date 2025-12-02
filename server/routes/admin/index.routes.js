import express from "express";
import accountRoutes from "./account.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Admin API of SnapBid!");
})

router.use(
  "/account",
  accountRoutes
)

router.use(
  "/category",
  categoryRoutes
)

router.use(
  "/product",
  productRoutes
)

router.use(
  "/user",
  userRoutes
)

export default router;