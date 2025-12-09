import express from 'express';
import * as categoryController from '../../controller/category.controller.js';

const router = express.Router();

router.get("/list", categoryController.getCategoryList);

export default router;