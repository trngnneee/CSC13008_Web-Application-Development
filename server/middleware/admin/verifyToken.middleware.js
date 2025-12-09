import jwt from "jsonwebtoken"
import { findUserToEmail, findUserById } from "../../service/user.service.js"

export const verifyToken = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.adminToken;

    if (!token) {
      return res.json({
        code: "error",
        message: "Token không tồn tại!"
      })
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (decoded == null) {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Xác thực token thất bại!"
      })
    }
    const { id_user, email, role: tokenRole } = decoded;
    const existUser = await findUserById(id_user);

    if (!existUser) {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Tài khoản không tồn tại trong hệ thống!"
      });
    }

    if (tokenRole && existUser.role !== tokenRole) {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Token không hợp lệ (role không khớp)!"
      });
    }

    // Check if role is "admin"
    if (existUser.role !== "admin") {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Bạn không có quyền truy cập tài nguyên admin!"
      });
    }

    req.account = existUser
  }
  catch (error) {
    res.json({
      code: "error",
      message: error
    })
  }

  next();
}