import { parseProductsCsv } from "../helper/parse.helper.js";
import * as productService from "../service/product.service.js";

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
        await productService.deleteProductID(id);
        res.json({
            code: "success",
            message: "Xóa sản phẩm thành công",
        })
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
    try {
        await productService.insertProduct(productData);
        res.json({
            code: "success",
            message: "Thêm sản phẩm thành công",
        })
    } catch (e) {
        res.status(500).json({
            code: "error",
            message: "Lỗi khi thêm sản phẩm.",
            data: e?.message || e,
        });
    }
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

    try {
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

