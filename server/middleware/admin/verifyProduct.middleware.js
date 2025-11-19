import {getProduct} from "../../service/product.service.js";

export const verifyProductExists = async (req, res, next) => {
    const {ids} = req.body;
    const notFoundIds = [];

    for (const id of ids) {
        const product = await getProduct(id);
        if (!product) {
            notFoundIds.push(id);
        }
    }
    if (notFoundIds.length > 0) {
        return res.status(400).json({
            code: "error",
            message: `Sản phẩm với ID sau không tồn tại: ${notFoundIds.join(", ")}`,
        });
    }

    next();
}