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

export const getCategoryDetail = async (req, res) => {
    const id = req.params.id;
    try {
        const category = await categoryService.getCategoryDetail(id);
        
        if (!category) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy category."
            });
        }

        return res.json({
            code: "success",
            message: "Lấy chi tiết category thành công",
            data: category
        });
    } catch (e) {
        return res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy chi tiết category.",
            data: e?.message || e
        });
    }
}

export const updateCategory = async (req, res) => {
    const id = req.params.id;
    const { name_category, id_parent_category } = req.body;

    try {
        if (!name_category && id_parent_category === undefined) {
            return res.status(400).json({
                code: "error",
                message: "Phải cung cấp ít nhất một trường để cập nhập."
            });
        }

        const updatedCategory = await categoryService.updateCategory(id, {
            name_category,
            id_parent_category
        });

        if (!updatedCategory) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy category."
            });
        }

        return res.json({
            code: "success",
            message: "Cập nhập category thành công",
            data: updatedCategory
        });
    } catch (e) {
        return res.status(500).json({
            code: "error",
            message: "Lỗi khi cập nhập category.",
            data: e?.message || e
        });
    }
}

export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  try {
    // Kiểm tra category này hoặc category con có product không
    if (await categoryService.isCatHasProducts(id)) {
      return res.status(400).json({
        code: "error",
        message: "Không thể xóa category vì còn sản phẩm liên quan.",
      });
    }

    // Xóa chỉ category không có product
    const deletedCategory = await categoryService.deleteCategory(id);

    if (!deletedCategory) {
      return res.status(404).json({ 
        code: "error",
        message: "Không tìm thấy category."
      });
    }

    return res.status(200).json({
      code: "success",
      message: `Đã xóa category "${deletedCategory.name_category}" thành công.`,
      data: {
        id_category: deletedCategory.id_category,
        name_category: deletedCategory.name_category
      }
    });
  } catch (e) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi xóa category.",
      data: e?.message || e,
    });
  }
};

export const deleteCategoryList = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      code: "error",
      message: "Danh sách ID không hợp lệ.",
    });
  }

  try {
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
            status: "success",
          });
        } else {
          result.push({
            id,
            status: "not_found",
            message: "Không tìm thấy category.",
          });
        }
      } catch (err) {
        result.push({
          id,
          status: "error",
          message: err?.message || err,
        });
      }
    }

    return res.status(200).json({
      code: "success",
      message: "Hoàn tất xử lý xóa danh sách category.",
      data: result,
    });
  } catch (e) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi xóa danh sách category.",
      data: e?.message || e,
    });
  }
};
