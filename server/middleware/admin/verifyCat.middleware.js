import { isInCategory } from "../../service/category.service.js";

export const checkParentCat = async (req, res, next) => {
    try {
        const parentName = req.body.parentName;
        if (!parentName) {
            return next();
        }

        const parentId = await isInCategory(parentName);
        if (!parentId) {
            return res.status(400).json({
                code: "error",
                message: `Parent category '${parentName}' không tồn tại.`,
            });
        }
        req.body.parentId = parentId;
        return next();
    } catch (error) {
        return res.status(500).json({
            code: "error",
            message: "Lỗi khi kiểm tra parent category.",
            data: error?.message || error,
        });
  }
}