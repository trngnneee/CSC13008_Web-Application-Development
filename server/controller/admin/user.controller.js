import * as userService from "../../service/user.service.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            code: "success",
            message: "Lấy danh sách người dùng thành công!",
            data: Math.ceil(users.length / 5),
        })
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lấy danh sách người dùng thất bại!",
            error: error.message
        })
    }
}