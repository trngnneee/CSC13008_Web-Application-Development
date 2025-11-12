import * as categoryService from "../../service/category.service.js";
import * as productService from "../../service/product.service.js";
import db from "../../config/database.config.js";

export const getCategoryList = async (req, res) => {
    let filter = {};

    if (req.query.keyword) {
        filter.keyword = req.query.keyword;
    }

    if (req.query.page)
    {
        filter.page = parseInt(req.query.page);
        filter.limit = 5;
    }

    const rawData = await categoryService.getAllCategory(filter);

    let categoryList = [];
    for (const item of rawData)
    {
        const parentInfo = categoryList.find(cate => cate.id === item.id_parent_category);
        categoryList.push({
            id: item.id_category,
            name: item.name_category,
            id_parent: item.id_parent_category,
            parent_name: parentInfo ? parentInfo.name : null,
        });
    }

    res.json({
        code: "success",
        message: "Lấy danh sách danh mục thành công",
        data: categoryList
    })
}

export const createCategory = async (req, res) => {
    const { name, parent } = req.body;

    await categoryService.insertCategory(name, parent);

    res.json({
        code: "success",
        message: "Tạo danh mục thành công",
    })
}

export const getTotalPage = async (req, res) => {
    const rawData = await getAllCategory(); 
    res.json({
        code: "success",
        message: "Lấy tổng số trang thành công",
        data: Math.ceil(rawData.length / 5)
    })
}

export const deleteCategory = async (req, res) => {
  const id = req.params.id;

  try {
    // Kiểm tra root 
    const rootName = await categoryService.getCategoryName(id);
    if (!rootName) {
      return res.status(404).json({ message: "Không tìm thấy category." });
    }

    let deletedProducts = 0;
    let deletedCategories = 0;

    await db.transaction(async (trx) => {
      // lấy toàn bộ id của subtree 
      const allIds = await categoryService.getDescendantCategoryIds(id, trx);

      // lấy ấy toàn bộ name_category tương ứng 
      const allNames = await categoryService.getCategoryNamesByIds(allIds, trx);

      for (const name of allNames) {
        deletedProducts += await productService.deleteProductByCategoryName(name, trx);
      }

      for (const catId of allIds) {
        deletedCategories += await categoryService.deleteCategoryID(catId, trx);
      }
    });

    return res.status(200).json({
      message: `Đã xóa category "${rootName}" và toàn bộ cây con.`,
      deletedProducts,
      deletedCategories,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi khi xóa category (và các con).",
      error: e?.message || e,
    });
  }
};


export const deleteCategoryList = async (req, res) => {
  const { ids } = req.body;
  await db.transaction(async (trx) => {
    for (const id of ids) {
      const nameCat = await categoryService.getCategoryName(id, trx);
      if (nameCat) {
        await productService.deleteProductByCategoryName(nameCat, trx);
        await categoryService.deleteCategoryID(id, trx);
      }
    }
    return res.status(200).json({
      message: `Đã xóa danh sách category và products liên quan.`,
    });
  });
};