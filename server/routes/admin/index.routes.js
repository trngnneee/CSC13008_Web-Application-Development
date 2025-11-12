import express from "express";
import accountRoutes from "./account.routes.js";
import categoryRoutes from "./product.routes.js";

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

export default router;