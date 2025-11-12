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
      ...result,
      unknownColumns,
      missingColumns,
    });
  } catch (e) {
    next(e);
  }
}

export const deleteProductByID = async (req, res) => {
    const id = req.params.id;
    await productService.deleteProductID(id);
    res.json({
        code: "success",
        message: "Xóa sản phẩm thành công",
    })
}
