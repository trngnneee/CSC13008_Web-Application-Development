import express from "express";

import * as categoryController from "../../controller/category.controller.js";

const router = express.Router();

router.get("/total-page", categoryController.getTotalPage);

router.get("/list", categoryController.getCategoryList);

router.post("/create", categoryController.createCategory);

router.delete("/delete-list", categoryController.deleteCategoryList);

router.get("/:id", categoryController.getCategoryDetail);

router.put("/:id", categoryController.updateCategory);

router.delete("/delete/:id", categoryController.deleteCategory);

export default router;