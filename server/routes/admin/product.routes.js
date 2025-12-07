import express from "express";
import multer from "multer";

import * as productController from "../../controller/product.controller.js";
import { verifyProductExists } from "../../middleware/admin/verifyProduct.middleware.js";
import { verifyToken } from "../../middleware/admin/verifyToken.middleware.js";

const router = express.Router();

const uploadCSV = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB,
    fileFilter: (req, file, cb) => {
        const ok = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.mimetype) || file.originalname.toLowerCase().endsWith(".csv") || file.originalname.toLowerCase().endsWith(".xls") || file.originalname.toLowerCase().endsWith(".xlsx");
        return ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file định dạng CSV hoặc Excel!"));
    },
});

// Image upload configuration
const uploadImages = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const ok = allowedMimes.includes(file.mimetype);
        return ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP)!"));
    },
});

router.post("/upload-csv", uploadCSV.single("file"), productController.uploadCSVProduct);

//Insert 1 product
router.post("/create", verifyToken, uploadImages.fields([
    { name: "images", maxCount: 10 },
    { name: "avatar", maxCount: 1 }
]), productController.insertProduct);

router.get("/total-page", productController.getTotalPage);

router.get("/list", productController.getProductList);

router.delete("/delete-list", verifyToken, productController.deleteAllProducts);

router.get("/:id", productController.getProductDetail);

//Update 1 product
router.patch("/update/:id", verifyToken, uploadImages.fields([
    { name: "images", maxCount: 10 },
    { name: "avatar", maxCount: 1 }
]), productController.updateProduct);

//Delete 1 product
router.delete("/delete/:id", productController.deleteProductByID);

export default router;