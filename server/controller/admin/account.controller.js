import bcrypt from "bcryptjs";
import { addUser, findUserToEmail } from "./../../service/user.service.js"
import jwt from "jsonwebtoken"

export const registerPost = async (req, res) => {
  const { fullname, email, password } = req.body;

  const existUser = await findUserToEmail(email);

  if (existUser) {
    return res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    })
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const result = await addUser({
    fullname: fullname,
    email: email,
    password: hashPassword,
    role: "admin",
    status: "initial"
  });

  if (result) {
    return res.json({
      code: "success",
      message: "Đăng ký thành công!"
    })
  }
  else {
    return res.json({
      code: "error",
      message: "Đăng ký thất bại!"
    })
  }
}

export const loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  const existUser = await findUserToEmail(email);
  if (!existUser) {
    return res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!"
    })
  };

  if (!bcrypt.compareSync(password, existUser.password)) {
    return res.json({
      code: "error",
      message: "Mật khẩu không chính xác!"
    });
  }

  if (existUser.status == "initial") {
    return res.json({
      code: "error",
      message: "Tài khoản chưa được kích hoạt!"
    })
  }

  const token = jwt.sign(
    {
      id_user: existUser.id_user,
      email: existUser.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword == true ? '30d' : '1d'
    }
  );

  res.cookie("adminToken", token, {
    maxAge: rememberPassword == true ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const verifyTokenGet = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.json({
        code: "error",
        message: "Token không tồn tại!"
      })
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (decoded == null)
    {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Xác thực token thất bại!"
      })
    }
    const { id_user, email } = decoded;
    const existUser = await findUserToEmail(email);

    if (!existUser) {
      res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: "Tài khoản không tồn tại trong hệ thống!"
      });
    }

    const userInfo = {
      id_user: existUser.id_user,
      fullname: existUser.fullname,
      email: existUser.email
    }

    res.json({
      code: "success",
      message: "Xác thực token thành công!",
      userInfo: userInfo
    })
  }
  catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: error
    })
  }
}