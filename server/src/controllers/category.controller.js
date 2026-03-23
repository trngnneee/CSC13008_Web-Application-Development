import asyncHandler from '../utils/asyncHandler.js';
import * as categoryService from '../services/category.service.js';

export const getCategoryList = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.keyword) filter.keyword = req.query.keyword;
  if (req.query.page) {
    filter.page = parseInt(req.query.page);
    filter.limit = 5;
  }

  const rawData = await categoryService.getAllCategory(filter);

  const categoryList = [];
  for (const item of rawData) {
    const parentInfo = categoryList.find((c) => c.id === item.id_parent_category);
    categoryList.push({
      id: item.id_category,
      name: item.name_category,
      id_parent: item.id_parent_category,
      parent_name: parentInfo ? parentInfo.name : null,
    });
  }

  return res.json({
    code: 'success',
    message: 'Lấy danh sách danh mục thành công',
    data: categoryList,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  await categoryService.insertCategory(name, parent);
  return res.json({ code: 'success', message: 'Tạo danh mục thành công' });
});

export const getTotalPage = asyncHandler(async (req, res) => {
  const rawData = await categoryService.getAllCategory();
  return res.json({
    code: 'success',
    message: 'Lấy tổng số trang thành công',
    data: Math.ceil(rawData.length / 5),
  });
});

export const getCategoryDetail = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryDetail(req.params.id);

  if (!category) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy category.' });
  }

  return res.json({
    code: 'success',
    message: 'Lấy chi tiết category thành công',
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name_category, id_parent_category } = req.body;

  if (!name_category && id_parent_category === undefined) {
    return res.status(400).json({ code: 'error', message: 'Phải cung cấp ít nhất một trường để cập nhập.' });
  }

  const updatedCategory = await categoryService.updateCategory(req.params.id, {
    name_category,
    id_parent_category,
  });

  if (!updatedCategory) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy category.' });
  }

  return res.json({
    code: 'success',
    message: 'Cập nhập category thành công',
    data: updatedCategory,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (await categoryService.isCatHasProducts(id)) {
    return res.status(400).json({
      code: 'error',
      message: 'Không thể xóa category vì còn sản phẩm liên quan.',
    });
  }

  const deletedCategory = await categoryService.deleteCategory(id);

  if (!deletedCategory) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy category.' });
  }

  return res.json({
    code: 'success',
    message: `Đã xóa category "${deletedCategory.name_category}" thành công.`,
    data: {
      id_category: deletedCategory.id_category,
      name_category: deletedCategory.name_category,
    },
  });
});

export const deleteCategoryList = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ code: 'error', message: 'Danh sách ID không hợp lệ.' });
  }

  const result = [];

  for (const id of ids) {
    try {
      const resDelete = await categoryService.deleteCategoryTree(id);
      if (resDelete) {
        result.push({
          id,
          rootName: resDelete.rootName,
          deletedProducts: resDelete.deletedProducts,
          deletedCategories: resDelete.deletedCategories,
          status: 'success',
        });
      } else {
        result.push({ id, status: 'not_found', message: 'Không tìm thấy category.' });
      }
    } catch (err) {
      result.push({ id, status: 'error', message: err?.message || err });
    }
  }

  return res.json({
    code: 'success',
    message: 'Hoàn tất xử lý xóa danh sách category.',
    data: result,
  });
});
