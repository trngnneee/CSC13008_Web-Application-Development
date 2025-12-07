import { parseProductsCsv } from "../helper/parse.helper.js";
import * as productService from "../service/product.service.js";
import { getCategoryID } from "../service/category.service.js";
import { uploadImagesToSupabase, uploadImageToSupabase, deleteImageFromSupabase } from "../helper/supabase.helper.js";

export async function uploadCSVProduct(req, res, next) {
    try {
        const fileBuf = req.file?.buffer;
        if (!fileBuf) {
            return res.status(400).json({ message: "CSV file required" });
        }

        const { records, unknownColumns, missingColumns } = await parseProductsCsv(fileBuf);
        const result = await productService.insertListProducts(records);

        res.json({
            code: "success",
            message: "Upload sản phẩm thành công",
            data: {
                ...result,
                unknownColumns,
                missingColumns,
            }
        });
    } catch (e) {
        next(e);
    }
}

export const deleteProductByID = async (req, res) => {
    const id = req.params.id;
    try {
        // Get product info before deleting
        const product = await productService.getProduct(id);
        
        if (!product) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm."
            });
        }

        // Delete avatar if exists
        if (product.avatar) {
            try {
                await deleteImageFromSupabase(product.avatar);
            } catch (err) {
                console.error("Lỗi khi xóa avatar:", err);
                // Continue deleting even if avatar deletion fails
            }
        }

        // Delete other images if exist
        if (product.url_img && Array.isArray(product.url_img)) {
            for (const imageUrl of product.url_img) {
                try {
                    await deleteImageFromSupabase(imageUrl);
                } catch (err) {
                    console.error("Lỗi khi xóa ảnh:", err);
                    // Continue deleting other images
                }
            }
        }

        // Delete product from database
        await productService.deleteProductID(id);
        
        res.json({
            code: "success",
            message: "Xóa sản phẩm thành công",
        });
    } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi xóa sản phẩm.",
            data: e?.message || e,
        });
    }
}

export const insertProduct = async (req, res) => {
  const productData = req.body;
  
  const catID = await getCategoryID(productData.name_category);
  if (!catID) {
    return res.json({
        code: "error",
        message: "Danh mục không tồn tại."
    })
  }
  productData.id_category = catID;

  // Add updated_by from logged in user (if exists)
  if (req.account?.id_user) {
    productData.updated_by = req.account.id_user;
  }

  try {
    const files = req.files || {};

    //avatar
    if (files?.avatar?.[0]) {
      const avatarFile = files.avatar[0];
      const avatarUrl = await uploadImageToSupabase(
        avatarFile.buffer,
        avatarFile.originalname
      );
      productData.avatar = avatarUrl;
    }

    // Product images
    if (files?.images && files.images.length > 0) {
      const imageUrls = await uploadImagesToSupabase(files.images);
      productData.url_img = imageUrls; // _text trong DB
    }

    await productService.insertProduct(productData);

    res.json({
      code: "success",
      message: "Thêm sản phẩm thành công",
    });
  } catch (e) {
    res.status(500).json({
      code: "error",
      message: "Lỗi khi thêm sản phẩm.",
      data: e?.message || e,
    });
  }
};

export const getTotalPage = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({
            code: "success",
            message: "Lấy danh sách sản phẩm thành công",
            data: Math.ceil(products.length / 5),
        });
    } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy danh sách sản phẩm.",
            data: e?.message || e,
        });
    }
};

export const getProductDetail = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await productService.getProduct(id);
        
        if (!product) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm."
            });
        }

        return res.json({
            code: "success",
            message: "Lấy chi tiết sản phẩm thành công",
            data: product
        });
    } catch (e) {
        return res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy chi tiết sản phẩm.",
            data: e?.message || e
        });
    }
};

export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const productData = req.body;
    
    if (req.account?.id_user) {
        productData.updated_by = req.account.id_user;
    }

    try {
        const oldProduct = await productService.getProduct(id);
        
        if (!oldProduct) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm."
            });
        }

        const files = req.files || {};

        if (files?.avatar?.[0]) {
            try {
                if (oldProduct.avatar) {
                    await deleteImageFromSupabase(oldProduct.avatar);
                }
                
                const avatarFile = files.avatar[0];
                const avatarUrl = await uploadImageToSupabase(
                    avatarFile.buffer,
                    avatarFile.originalname
                );
                productData.avatar = avatarUrl;
            } catch (uploadError) {
                return res.status(400).json({
                    code: "error",
                    message: "Lỗi khi upload avatar lên Supabase.",
                    data: uploadError?.message || uploadError,
                });
            }
        }

        // Handle images if provided
        if (files?.images && files.images.length > 0) {
            try {
                // Delete old images if exist
                if (oldProduct.url_img && Array.isArray(oldProduct.url_img)) {
                    for (const imageUrl of oldProduct.url_img) {
                        try {
                            await deleteImageFromSupabase(imageUrl);
                        } catch (err) {
                            console.error("Lỗi khi xóa ảnh:", err);
                        }
                    }
                }
                
                const imageUrls = await uploadImagesToSupabase(files.images);
                productData.url_img = imageUrls;
            } catch (uploadError) {
                return res.status(400).json({
                    code: "error",
                    message: "Lỗi khi upload ảnh lên Supabase.",
                    data: uploadError?.message || uploadError,
                });
            }
        }

        const updatedProduct = await productService.updateProduct(id, productData);

        if (!updatedProduct) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm."
            });
        }

        return res.json({
            code: "success",
            message: "Cập nhập sản phẩm thành công",
            data: updatedProduct
        });
    } catch (e) {
        return res.status(500).json({
            code: "error",
            message: "Lỗi khi cập nhập sản phẩm.",
            data: e?.message || e
        });
    }
};

export const getProductList = async (req, res) => {
    try {
        let filter = {};

        if (req.query.keyword) {
            filter.keyword = req.query.keyword;
        }

        if (req.query.page) {
            filter.page = parseInt(req.query.page);
            filter.limit = 5;
        }

        if (req.query.limit) {
            filter.limitItem = parseInt(req.query.limit);
        }

        const products = await productService.getAllProducts(filter);
        res.json({
            code: "success",
            message: "Lấy danh sách sản phẩm thành công",
            data: products
        })
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy danh sách sản phẩm.",
            data: error?.message || error,
        });
    }
}

export const deleteAllProducts = async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            code: "error",
            message: "Danh sách ID không hợp lệ.",
        });
    }

   try {
        await productService.deleteProductList(ids);
        res.json({
            code: "success",
            message: "Xóa danh sách sản phẩm thành công",
        });
   } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi xóa danh sách sản phẩm.",
        });
   }
}

export const getProductListByCategory = async (req, res) => {
    const { id_category } = req.params;

    try {
        let filter = {};

        if (req.query.keyword) {
            filter.keyword = req.query.keyword;
        }

        if (req.query.page) {
            filter.page = parseInt(req.query.page);
            filter.limit = 5;
        }

        const products = await productService.getProductsByCategory(id_category, filter);
        
        res.json({
            code: "success",
            message: "Lấy danh sách sản phẩm theo danh mục thành công",
            data: products
        });
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy danh sách sản phẩm theo danh mục.",
            data: error?.message || error,
        });
    }
}

export const getTotalPageByCategory = async (req, res) => {
    const { id_category } = req.params;

    try {
        const products = await productService.getProductsByCategory(id_category);
        res.json({
            code: "success",
            message: "Lấy tổng số trang sản phẩm theo danh mục thành công",
            data: Math.ceil(products.length / 5),
        });
    } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi lấy tổng số trang sản phẩm theo danh mục.",
            data: e?.message || e,
        });
    }
}