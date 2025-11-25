import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";

import { 
  addUser, 
  findUserToEmail, 
  resetPassword, 
  saveOTP, 
  verifyOTP, 
  createVerifyEmail, 
  findVerifyEmailToken, 
  markVerifyTokenUsed, 
  changeUserRole 
} from "./user.service.js";
import { OTPGenerate } from "../helper/otp.helper.js";
import { sendVarifyMail } from "../helper/mail.helper.js";

export const handleRegister = async (userData, role = "bidder") => {
  const { fullname, email, password } = userData;

  const existUser = await findUserToEmail(email);
  if (existUser) {
    return {
      success: false,
      message: "Email đã tồn tại trong hệ thống!"
    };
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const result = await addUser({
    fullname,
    email,
    password: hashPassword,
    role,
    status: "initial"
  });

  if (result) {
    const verifyToken = await createVerifyEmail(result.id_user);
    await sendVarifyMail(email, verifyToken);

    return {
      success: true,
      message: "Đăng ký thành công!"
    };
  }

  return {
    success: false,
    message: "Đăng ký thất bại!"
  };
};

export const handleLogin = async (credentials) => {
  const { email, password, rememberPassword } = credentials;

  const existUser = await findUserToEmail(email);
  if (!existUser) {
    return {
      success: false,
      message: "Email không tồn tại trong hệ thống!"
    };
  }

  if (!bcrypt.compareSync(password, existUser.password)) {
    return {
      success: false,
      message: "Mật khẩu không chính xác!"
    };
  }

  if (existUser.status === "initial") {
    return {
      success: false,
      message: "Tài khoản chưa được kích hoạt!"
    };
  }

  const token = jwt.sign(
    {
      id_user: existUser.id_user,
      email: existUser.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword === true ? "30d" : "1d"
    }
  );

  const tokenMaxAge = rememberPassword === true 
    ? 30 * 24 * 60 * 60 * 1000 
    : 24 * 60 * 60 * 1000;

  return {
    success: true,
    message: "Đăng nhập thành công!",
    token,
    tokenMaxAge,
    user: {
      id_user: existUser.id_user,
      fullname: existUser.fullname,
      email: existUser.email
    }
  };
};

export const handleVerifyToken = async (token) => {
  if (!token) {
    return {
      success: false,
      message: "Token không tồn tại!"
    };
  }

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (!decoded) {
      return {
        success: false,
        message: "Xác thực token thất bại!"
      };
    }

    const { id_user, email } = decoded;
    const existUser = await findUserToEmail(email);

    if (!existUser) {
      return {
        success: false,
        message: "Tài khoản không tồn tại trong hệ thống!"
      };
    }

    return {
      success: true,
      message: "Xác thực token thành công!",
      user: {
        id_user: existUser.id_user,
        fullname: existUser.fullname,
        email: existUser.email
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Xác thực token thất bại!"
    };
  }
};

export const handleForgotPassword = async (email) => {
  try {
    const otp = OTPGenerate(6);
    const record = await saveOTP({ email, otp });

    if (record) {
      return {
        success: true,
        message: "Đã gửi OTP về email!"
      };
    }

    return {
      success: false,
      message: "Lỗi gửi OTP về email!"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi gửi OTP về email!"
    };
  }
};

export const handleOtpPassword = async (email, otp) => {
  try {
    const record = await verifyOTP({ email, otp });

    if (!record.success) {
      return {
        success: false,
        message: record.message
      };
    }

    const existUser = await findUserToEmail(email);
    if (!existUser) {
      return {
        success: false,
        message: "Tài khoản không tồn tại!"
      };
    }

    const token = jwt.sign(
      {
        id_user: existUser.id_user,
        email: existUser.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return {
      success: true,
      message: "Xác thực OTP thành công!",
      token,
      tokenMaxAge: 24 * 60 * 60 * 1000
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Xác thực OTP thất bại!"
    };
  }
};

export const handleResetPassword = async (email, password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const record = await resetPassword(email, hashPassword);
    if (record) {
      return {
        success: true,
        message: "Đổi mật khẩu thành công!"
      };
    }

    return {
      success: false,
      message: "Đổi mật khẩu thất bại"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Đổi mật khẩu thất bại"
    };
  }
};

export const handleVerifyEmail = async (token, role) => {
  if (!token) {
    return {
      success: false,
      message: "Token không tồn tại!"
    };
  }

  try {
    const record = await findVerifyEmailToken(token);

    if (!record) {
      return {
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn!"
      };
    }

    await markVerifyTokenUsed(record.id_user);

    const fileName = role === "admin" ? "change-direct.html" : "change-direct-client.html";
    const filePath = path.join(process.cwd(), "public", fileName);
    return {
      success: true,
      message: "Email verified successfully!",
      filePath
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Email verification failed!"
    };
  }
};

export const handleChangeRole = async (id_user, role) => {
  try {
    if (!role || role !== "bidder") {
      return {
        success: false,
        message: "Vai trò không hợp lệ!"
      };
    }

    const updatedUser = await changeUserRole(id_user, role);
    if (updatedUser) {
      return {
        success: true,
        message: "Cập nhật vai trò thành công!"
      };
    }

    return {
      success: false,
      message: "Cập nhật vai trò thất bại!"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Cập nhật vai trò thất bại!"
    };
  }
};
