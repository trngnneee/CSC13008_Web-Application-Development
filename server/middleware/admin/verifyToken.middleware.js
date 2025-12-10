import jwt from "jsonwebtoken"
import { findUserById } from "../../service/user.service.js"

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        code: "error",
        message: "Token không tồn tại!"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        code: "error",
        message: "Token không hợp lệ hoặc đã hết hạn!"
      });
    }

    const { id_user, role: tokenRole } = decoded;

    const existUser = await findUserById(id_user);

    if (!existUser) {
      res.clearCookie("adminToken");
      return res.status(401).json({
        code: "error",
        message: "Tài khoản không tồn tại trong hệ thống!"
      });
    }

    if (existUser.role !== tokenRole) {
      res.clearCookie("adminToken");
      return res.status(403).json({
        code: "error",
        message: "Token không hợp lệ (role không khớp)!"
      });
    }

    if (existUser.role !== "admin") {
      return res.status(403).json({
        code: "error",
        message: "Bạn không có quyền truy cập tài nguyên admin!"
      });
    }

    req.account = existUser;

    next(); // only call next if everything is OK

  } catch (error) {
    console.error("[verifyToken error]", error);
    return res.status(500).json({
      code: "error",
      message: "Lỗi xác thực token!"
    });
  }
};
