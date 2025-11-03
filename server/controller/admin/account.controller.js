import bcrypt from "bcryptjs";
import { addUser, findUserToEmail, resetPassword, saveOTP, verifyOTP } from "./../../service/user.service.js"
import jwt from "jsonwebtoken"
import { OTPGenerate } from "../../helper/otp.helper.js";

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
    if (decoded == null) {
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

export const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  const otp = OTPGenerate(6);

  const record = await saveOTP({ email, otp });
  if (record) {
    return res.json({
      code: "success",
      message: "Đã gửi OTP về email!"
    })
  }
  else return res.json({
    code: "error",
    message: "Lỗi gửi OTP về email!"
  })
}

export const otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;

  const record = await verifyOTP({ email, otp });

  if (record.success == false) return res.json({
    code: "error",
    message: record.message
  });

  const existUser = await findUserToEmail(email);

  const token = jwt.sign(
    {
      id_user: existUser.id_user,
      email: existUser.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  res.cookie("adminToken", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.json({
    code: "success",
    message: "Xác thực OTP thành công!"
  })
}

export const resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const record = await resetPassword(req.account.email, hashPassword);
  if (record) return res.json({
    code: "success",
    message: "Đổi mật khẩu thành công!"
  })
  else return res.json({
    code: "error",
    message: "Đổi mật khẩu thất bại"
  })
}