import jwt from "jsonwebtoken"
import { findUserToEmail } from "../../service/user.service.js"

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

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
    const { id_user, email } = decoded;
    const existUser = await findUserToEmail(email);

    if (!existUser) {
      res.clearCookie("clientToken");
      return res.json({
        code: "error",
        message: "Tài khoản không tồn tại trong hệ thống!"
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