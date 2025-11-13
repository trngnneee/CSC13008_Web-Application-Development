import express from "express";

import * as categoryController from "../../controller/admin/category.controller.js";
import { checkParentCat } from "../../middleware/admin/verifyCat.middleware.js";

const router = express.Router();

router.get("/list", categoryController.getCategoryList);

router.post("/create", checkParentCat, categoryController.createCategory);

router.get("/total-page", checkParentCat, categoryController.getTotalPage);

router.delete("/delete/:id", checkParentCat, categoryController.deleteCategory);

router.delete("/delete-list", checkParentCat, categoryController.deleteCategoryList);

export default router;