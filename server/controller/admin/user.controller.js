import * as userService from "../../service/user.service.js";

export const getUserList = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            code: "success",
            message: "Lấy danh sách người dùng thành công!",
            data: users
        })
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lấy danh sách người dùng thất bại!",
            error: error.message
        })
    }
}

export const getTotalPage = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            code: "success",
            message: "Lấy tổng số trang người dùng thành công!",
            data: Math.ceil(users.length / 5),
        })
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lấy tổng số trang người dùng thất bại!",
            error: error.message
        })
    }
}

export const getUserDetail = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await userService.findUserById(id);

        if (!user) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy người dùng!"
            });
        }

        return res.status(200).json({
            code: "success",
            message: "Lấy chi tiết người dùng thành công!",
            data: {
                id_user: user.id_user,
                fullname: user.fullname,
                email: user.email,
                date_of_birth: user.date_of_birth,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Lấy chi tiết người dùng thất bại!",
            error: error.message
        });
    }
}