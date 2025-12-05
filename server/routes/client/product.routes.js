import express from "express";
import * as productController from "../../controller/product.controller.js"; 

const router = express.Router();

router.get("/total-page", productController.getTotalPage);

router.get("/list", productController.getProductList);

router.get("/list-category/:id_category", productController.getProductListByCategory);

router.get("/total-page-category/:id_category", productController.getTotalPageByCategory);

router.get("/detail/:id", productController.getProductDetail);

// router.post("/create", productController.insertProduct);
export default router;