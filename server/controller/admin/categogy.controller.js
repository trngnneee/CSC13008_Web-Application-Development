import * as parseHelper from "../../helper/parse.helper.js";
import { insertProducts, getAllCategory, addSingleCategory } from "../../service/category.service.js";

export async function uploadCSVCategory(req, res, next) {
    try {
        // 1) đã nhận file
        const file = req.file; // nếu dùng fields/any thì lấy từ req.files[...]
        if (!file || !file.buffer?.length) {
            return res.status(400).json({ code: "error", message: "File rỗng" });
        }

        // 2) parse CSV → map field thiếu = null
        const { records, unknownColumns, missingColumns } =
            parseHelper.parseProductsCsv(file.buffer);

        // 3) insert DB (ID tự tăng)
        const { inserted, skipped_empty, total, failed, errors } =
            await insertProducts(records);

        // 4) trả kết quả
        return res.json({
            total,
            inserted,
            skipped_empty,
            failed,
            errors,
            unknownColumns,
            missingColumns,
        });
    } catch (err) {
        next(err);
    }
}

export const getCategoryList = async (req, res) => {
    const rawData = await getAllCategory();

    let categoryList = [];
    for (const item of rawData)
    {
        categoryList.push({
            id: item.id_category,
            name: item.name_category,
            id_parent: item.id_parent_category
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

    await addSingleCategory(name, parent);

    res.json({
        code: "success",
        message: "Tạo danh mục thành công",
    })
}