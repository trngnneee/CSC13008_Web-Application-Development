import express from "express";
import multer from "multer";

import * as productController from "../../controller/admin/product.controller.js";
import { verifyProductExists } from "../../middleware/admin/verifyProduct.middleware.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB,
    fileFilter: (req, file, cb) => {
        const ok = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.mimetype) || file.originalname.toLowerCase().endsWith(".csv") || file.originalname.toLowerCase().endsWith(".xls") || file.originalname.toLowerCase().endsWith(".xlsx");
        return ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file định dạng CSV hoặc Excel!"));
    },
});

router.post("/upload-csv", upload.single("file"), productController.uploadCSVProduct);

router.get("/list", productController.getProductList);

router.get("/:id", productController.getProductDetail);

router.post("/create", productController.insertProduct);

router.put("/:id", productController.updateProduct);

router.delete("/delete/:id", productController.deleteProductByID);

router.delete("/delete-list", verifyProductExists, productController.deleteAllProducts);

router.get("/total-page", productController.getTotalPage);

export default router;