import { parseProductsCsv } from "../helper/parse.helper.js";
import * as productService from "../service/product.service.js";
import { uploadImagesToSupabase, uploadImageToSupabase, deleteImageFromSupabase } from "../helper/supabase.helper.js";
import db from "../config/database.config.js";
import { getAllChildCategoryIDs } from "../helper/category.helper.js";

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
    const files = req.files || {};

    productData.created_by = req.account?.id_user || null;
    productData.updated_by = req.account?.id_user || null;
    if (files && files.length > 0) {
        productData.url_img = files.map((file) => file.path);
    }

    await db('product').insert({
        id_category: productData.id_category,
        avatar: files && files.length > 0 ? files[0].path : null,
        name: productData.name,
        price: productData.price,
        immediate_purchase_price: productData.immediate_purchase_price,
        posted_date_time: new Date(),
        description: productData.description,
        pricing_step: productData.pricing_step,
        starting_price: productData.starting_price,
        url_img: productData.url_img,
        updated_by: productData.updated_by,
        created_by: productData.created_by,
    });

    await db('description_history').insert({
        id_product: productData.id_product,
        time: new Date(),
        description: productData.description,
    });

    res.json({
        code: "success",
        message: "Thêm sản phẩm thành công",
    })
};

export const updateProductDescription = async (req, res) => {
    const id = req.params.id;
    const { description } = req.body;

    await db('description_history').insert({
        id_product: id,
        time: new Date(),
        description: description,
    });
    
    res.json({
        code: "success",
        message: "Cập nhật mô tả sản phẩm thành công",
    })
};

export const getProductDescriptionHistory = async (req, res) => {
    const id = req.params.id;

    const descriptionHistory = await db('description_history').select('*').where('id_product', id).orderBy('time', 'desc');

    res.json({
        code: "success",
        message: "Lấy lịch sử mô tả sản phẩm thành công",
        descriptionHistory: descriptionHistory
    })
}

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

export const getTopPriceProductList = async (req, res) => {
    const productList = await db("product")
        .select("product.*", 'user.fullname as seller')
        .join("user", "product.created_by", "user.id_user")
        .orderBy("price", "desc")
        .limit(4);

    res.json({
        code: "success",
        message: "Lấy danh sách sản phẩm có giá cao nhất thành công",
        productList: productList,
    })
}

export const getProductDetailByID = async (req, res) => {
    const id = req.params.id;

    const productDetail = await db("product")
        .select("product.*", 'category.name_category', 'user.fullname as seller', 'user.id_user as seller_id', 'user.email as seller_email')
        .where("product.id_product", id)
        .join("category", "product.id_category", "category.id_category")
        .join("user", "product.created_by", "user.id_user")
        .first();

    res.json({
        code: "success",
        message: "Lấy chi tiết sản phẩm thành công",
        productDetail: productDetail,
    })
}

export const getProductListBySeller = async (req, res) => {
    const { sellerID } = req.params;

    const query = db("product")
        .where("created_by", sellerID)
        .select("product.*", 'category.name_category')
        .join("category", "product.id_category", "category.id_category");

    const pageSize = 5;
    const countResult = await db('product').where("created_by", sellerID).count('* as count').first();
    const totalPages = Math.ceil(Number(countResult.count) / pageSize);
    if (req.query.page) {
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * pageSize;
        query.limit(pageSize).offset(offset);
    }

    const productList = await query;

    res.json({
        code: "success",
        message: "Lấy danh sách sản phẩm của người bán thành công",
        productList: productList,
        totalPages: totalPages,
    })
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
        const products = await productService.getProductsByIds(ids);

        if (!products || products.length === 0) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm nào.",
            });
        }

        // Delete all images from Supabase
        for (const product of products) {
            // Delete avatar if exists
            if (product.avatar) {
                try {
                    await deleteImageFromSupabase(product.avatar);
                } catch (err) {
                    console.error("Lỗi khi xóa avatar:", err);
                }
            }

            // Delete other images if exist
            if (product.url_img && Array.isArray(product.url_img)) {
                for (const imageUrl of product.url_img) {
                    try {
                        await deleteImageFromSupabase(imageUrl);
                    } catch (err) {
                        console.error("Lỗi khi xóa ảnh:", err);
                    }
                }
            }
        }

        // Delete products from database
        await productService.deleteProductList(ids);

        res.json({
            code: "success",
            message: "Xóa danh sách sản phẩm thành công",
        });
    } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi xóa danh sách sản phẩm.",
            data: e?.message || e,
        });
    }
}

export const getProductListByCategory = async (req, res) => {
    const { id_category } = req.params;

    try {
        const categoryDetail = await db("category").where("id_category", id_category).first();

        if (!categoryDetail) {
            return res.json({
                code: "error",
                message: "Không tìm thấy danh mục."
            });
        }

        const categoryIDs = await getAllChildCategoryIDs(categoryDetail.id_category);

        const query = db("product").whereIn("id_category", categoryIDs);

        const pageSize = 4 * 3;
        const countResult = await db('product').whereIn("id_category", categoryIDs).count('* as count').first();
        const totalPages = Math.ceil(Number(countResult.count) / pageSize);
        if (req.query.page) {
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * pageSize;
            query.limit(pageSize).offset(offset);
        }

        if (req.query.status)
        {
            const status = req.query.status;
            if (status === "price-asc") {
                query.orderBy("price", "asc");
            } else if (status === "price-desc") {
                query.orderBy("price", "desc");
            } else if (status === "end-asc") {
                query.orderBy("posted_date_time", "asc");
            } else if (status === "end-desc") {
                query.orderBy("posted_date_time", "desc");
            }
        }

        const productList = await query;

        res.json({
            code: "success",
            message: "Lấy danh sách sản phẩm theo danh mục thành công",
            productList: productList,
            categoryName: categoryDetail.name_category,
            totalPages: totalPages,
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