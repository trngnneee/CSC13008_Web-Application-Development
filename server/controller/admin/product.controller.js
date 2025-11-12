import { parseProductsCsv } from "../../helper/parse.helper.js";
import * as productService from "../../service/product.service.js";

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
    try{
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
    try{
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
