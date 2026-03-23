import express from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { buildCategoryTree } from '../../services/category.service.js';
import db from '../../config/database.js';

const router = express.Router();

router.get('/list', categoryController.getCategoryList);

router.get('/tree-list', async (req, res) => {
  const categoryList = await db('category').select('*');
  const categoryTree = buildCategoryTree(categoryList);

  res.json({
    code: 'success',
    message: 'Lấy danh mục có con thành công',
    categoryTree,
  });
});

router.get('/parent-list', async (req, res) => {
  const query = db('category').whereNull('id_parent_category');

  const pageSize = 4 * 3;
  const countResult = await db('category').whereNull('id_parent_category').count('* as count').first();
  const totalPages = Math.ceil(Number(countResult.count) / pageSize);

  if (req.query.page) {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  const parentCategories = await query;

  res.json({
    code: 'success',
    message: 'Lấy danh mục cha thành công',
    parentCategories,
    totalPages,
  });
});

export default router;
