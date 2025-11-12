import { parseProductsCsv } from "../../helper/parse.helper.js";
import { insertListProducts } from "../../service/product.service.js";

export async function uploadCSVProduct(req, res, next) {
  try {
    const fileBuf = req.file?.buffer;
    if (!fileBuf) {
      return res.status(400).json({ message: "CSV file required" });
    }
    
    const { records, unknownColumns, missingColumns } = await parseProductsCsv(fileBuf);
    const result = await insertListProducts(records);

    res.json({
      ...result,
      unknownColumns,
      missingColumns,
    });
  } catch (e) {
    next(e);
  }
}
