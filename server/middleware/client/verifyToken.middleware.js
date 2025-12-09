import jwt from "jsonwebtoken"
import { findUserById } from "../../service/user.service.js"

export const verifyToken = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.clientToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.json({
        code: "error",
        message: "Token không tồn tại!"
      })
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (decoded == null) {
      res.clearCookie("clientToken");
      return res.json({
        code: "error",
        message: "Xác thực token thất bại!"
      })
    }
    const { id_user, email, role: tokenRole } = decoded;
    const existUser = await findUserById(id_user);

    if (!existUser) {
      res.clearCookie("clientToken");
      return res.json({
        code: "error",
        message: "Tài khoản không tồn tại trong hệ thống!"
      });
    }

    // Check if role matches token
    if (tokenRole && existUser.role !== tokenRole) {
      res.clearCookie("clientToken");
      return res.json({
        code: "error",
        message: "Token không hợp lệ (role không khớp)!"
      });
    }

    // Check if role is "bidder" or "seller"
    if (existUser.role !== "bidder" && existUser.role !== "seller") {
      res.clearCookie("clientToken");
      return res.json({
        code: "error",
        message: "Bạn không có quyền truy cập tài nguyên client!"
      });
    }

    req.account = existUser
  }
  catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: error
    })
  }

  next();
}