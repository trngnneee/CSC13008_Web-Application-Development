import express from "express";
import * as productController from "../../controller/product.controller.js"; 
import * as clientMiddleware from "../../middleware/client/verifyToken.middleware.js";
import bidRoutes from "./bid.routes.js";
import multer from "multer";
import { storage } from "../../helper/cloudinary.js";

const upload = multer({ storage });

const router = express.Router();

router.get("/total-page", productController.getTotalPage);

router.get("/list", productController.getProductList);

router.get("/list/top-price", productController.getTopPriceProductList);

router.get("/list/ending-soon", productController.getEndingSoonProductList);

router.get("/detail/:id", productController.getProductDetailByID);

router.get("/list/seller/:sellerID", productController.getProductListBySeller);

router.get("/list-category/:id_category", productController.getProductListByCategory);

router.get("/total-page-category/:id_category", productController.getTotalPageByCategory);

router.delete("/delete/:id", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("seller"), productController.deleteProductByID);

router.post("/create", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("seller"), upload.array("files", 10), productController.insertProduct);

router.post("/update/:id", clientMiddleware.verifyToken, productController.updateProductDescription);

router.get("/description-history/:id", productController.getProductDescriptionHistory);

//Bid routes
router.use("/bid", bidRoutes);

export default router;