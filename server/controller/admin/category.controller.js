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
    const rawData = await categoryService.getAllCategory(); 
    res.json({
        code: "success",
        message: "Lấy tổng số trang thành công",
        data: Math.ceil(rawData.length / 5)
    })
}

export const deleteCategory = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await categoryService.deleteCategoryTree(id);

    if (!result) {
      return res.status(404).json({ 
        code: "error",
        message: "Không tìm thấy category."
      });
    }

    return res.status(200).json({
      code: "success",
      message: `Đã xóa category "${result.rootName}" và toàn bộ cây con.`,
      data: {
        deletedProducts: result.deletedProducts,
        deletedCategories: result.deletedCategories
      }
    });
  } catch (e) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi xóa category (và các con).",
      data: e?.message || e,
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