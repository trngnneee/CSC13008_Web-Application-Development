import express from "express";

import * as categoryController from "../../controller/admin/category.controller.js";

const router = express.Router();

router.get("/list", categoryController.getCategoryList);

router.get("/:id", categoryController.getCategoryDetail);

router.put("/:id", categoryController.updateCategory);

router.post("/create", categoryController.createCategory);

router.get("/total-page", categoryController.getTotalPage);

router.delete("/delete/:id", categoryController.deleteCategory);

router.delete("/delete-list", categoryController.deleteCategoryList);

export default router;