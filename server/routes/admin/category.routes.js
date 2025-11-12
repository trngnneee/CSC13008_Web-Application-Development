import express from "express";
import multer from "multer";

import * as categoryController from "../../controller/admin/categogy.controller.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    litmits: { filesize: 20 * 1024 * 1024 }, // 20MB,
    fileFilter: (req, file, cb) => {
        const ok = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.mimetype) || file.originalname.toLowerCase().endsWith(".csv") || file.originalname.toLowerCase().endsWith(".xls") || file.originalname.toLowerCase().endsWith(".xlsx");
        return ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file định dạng CSV hoặc Excel!"));
    },
});

router.post("/upload-csv", upload.single("file"), categoryController.uploadCSVCategory);

router.get("/list", categoryController.getCategoryList);

router.post("/create", categoryController.createCategory);

router.get("/total-page", categoryController.getTotalPage);

export default router;