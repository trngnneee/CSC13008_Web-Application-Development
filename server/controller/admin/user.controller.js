import bcrypt from "bcryptjs";
import * as userService from "../../service/user.service.js";
import { sendResetPasswordMail } from "../../helper/mail.helper.js";

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
export const updateUserPut = (req, res) => {
    const id = req.params.id;
    const { fullname, date_of_birth, role } = req.body;

    userService.findUserById(id).then(async (user) => {
        if (!user) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy người dùng!"
            });
        }
        await userService.updateUserById(id, {
            fullname,
            date_of_birth,
            role,
        });
        return res.status(200).json({
            code: "success",
            message: "Cập nhật người dùng thành công!"
        });
    }).catch((error) => {
        res.status(500).json({
            code: "error",
            message: "Cập nhật người dùng thất bại!",
            error: error.message
        });
    });
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

export const resetPassword = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await userService.findUserById(id);
        if (!user) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy người dùng!"
            });
        }

        // Tạo mật khẩu ngẫu nhiên đảm bảo:
        // - Ít nhất 8 ký tự
        // - Ít nhất 1 ký tự đặc biệt
        // - Ít nhất 1 ký tự in hoa
        // - Ít nhất 1 số
        const generateSecurePassword = () => {
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const special = '!@#$%^&*';
            
            // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
            let password = '';
            password += uppercase[Math.floor(Math.random() * uppercase.length)];
            password += lowercase[Math.floor(Math.random() * lowercase.length)];
            password += numbers[Math.floor(Math.random() * numbers.length)];
            password += special[Math.floor(Math.random() * special.length)];
            
            // Thêm 4 ký tự ngẫu nhiên nữa để đủ 8 ký tự
            const allChars = uppercase + lowercase + numbers + special;
            for (let i = 0; i < 4; i++) {
                password += allChars[Math.floor(Math.random() * allChars.length)];
            }
            
            // Xáo trộn mật khẩu
            return password.split('').sort(() => Math.random() - 0.5).join('');
        };
        
        const newPassword = generateSecurePassword();
        
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(newPassword, salt);

        await userService.updateUserById(id, {
            password: hashPassword
        });

        // Gửi mail thông báo mật khẩu mới cho người dùng
        await sendResetPasswordMail(user.email, newPassword);

        return res.status(200).json({
            code: "success",
            message: "Đặt lại mật khẩu thành công! Email đã được gửi đến người dùng."
        });
    } catch (error) {
        res.status(500).json({
            code: "error",
            message: "Đặt lại mật khẩu thất bại!",
            error: error.message
        });
    }
}