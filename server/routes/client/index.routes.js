import express from "express";
import userRoute from "./user.routes.js";
import accountRoutes from "./account.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import searchRoutes from "./search.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Client API of SnapBid!");
})

router.use(
  "/user", 
  userRoute
);

router.use(
  "/account",
  accountRoutes
)

router.use(
  "/product",
  productRoutes
);

router.use(
  "/category",
  categoryRoutes
);

router.use(
  "/search",
  searchRoutes
)

export default router;