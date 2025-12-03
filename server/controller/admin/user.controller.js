import bcrypt from "bcryptjs";
import * as userService from "../../service/user.service.js";

export const getUserList = async (req, res) => {
    try {
        let filter = {};
        if (req.query.page)
        {
            filter.page = parseInt(req.query.page);
            filter.limit = 5;
        }
        if (req.query.keyword) {
            filter.keyword = req.query.keyword;
        }

        const users = await userService.getAllUsers(filter);
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

export const createUserPost = async (req, res) => {
    const existUser = await userService.findUserToEmailAndRole(req.body.email, req.body.role);
    if (existUser) {
        return res.status(400).json({
            code: "error",
            message: "Người dùng với email và vai trò này đã tồn tại!"
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(req.body.password, salt);

    await userService.addUser({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hashPassword,
        date_of_birth: req.body.date_of_birth,
        role: req.body.role,
        status: "active",
    });

    res.json({
        code: "success",
        message: "Tạo người dùng thành công!"
    })
}

export const deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await userService.findUserById(id);
        if (!user) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy người dùng!"
            });
        }
        await userService.deleteUserById(id);

        return res.status(200).json({
            code: "success",
            message: "Xóa người dùng thành công!"
        });
    }
    catch (error) {
        res.status(500).json({
            code: "error",
            message: "Xóa người dùng thất bại!",
            error: error.message
        });
    }
}

export const deleteUserList = async (req, res) => {
    const ids = req.body.ids; 

    try {
        for (const id of ids) {
            const user = await userService.findUserById(id);
            if (user) {
                await userService.deleteUserById(id);
            }
        }
        return res.status(200).json({   
            code: "success",
            message: "Xóa danh sách người dùng thành công!"
        });
    }
    catch (error) {
        res.status(500).json({
            code: "error",
            message: "Xóa danh sách người dùng thất bại!",
            error: error.message
        });
    }
}