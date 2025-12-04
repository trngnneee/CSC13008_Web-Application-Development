import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { 
  addUser, 
  findUserToEmail, 
  findUserById,
  resetPassword, 
  saveOTP, 
  verifyOTP, 
  createVerifyEmail, 
  findVerifyEmailToken, 
  markVerifyTokenUsed, 
  changeUserRole 
} from "./user.service.js";
import { OTPGenerate } from "../helper/otp.helper.js";
import { sendVarifyMail, sendOTPMail } from "../helper/mail.helper.js";

export const handleRegister = async (userData, role) => {
  const { fullname, email, password } = userData;

  const existUser = await findUserToEmail(email, role);

  if (existUser && existUser.role === "seller") {
    return {
      success: false,
      message: "Email này đã được đăng ký với vai trò người bán."
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
    const verifyToken = await createVerifyEmail(result.id_user, role);
    await sendVarifyMail(email, verifyToken, role);

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

  // Nếu user là seller, không được phép đăng nhập
  // if (existUser.role === "seller") {
  //   return {
  //     success: false,
  //     message: "Tài khoản này không được phép đăng nhập!"
  //   };
  // }

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
      // Gửi OTP qua email
      await sendOTPMail(email, otp);
      
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
        email: existUser.email,
        role: existUser.role
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

export const handleVerifyEmail = async (token) => {
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

    // Decode token để lấy role từ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenRole = decoded.role || "bidder";

    const existUser = await findUserById(record.id_user);
    if (!existUser) {
      return {
        success: false,
        message: "Tài khoản không tồn tại!"
      };
    }

    // Check user role khớp với token role
    if (existUser.role !== tokenRole) {
      return {
        success: false,
        message: `Token này dành cho role ${tokenRole}, nhưng tài khoản của bạn là role ${existUser.role}!`
      };
    }

    await markVerifyTokenUsed(record.id_user);

    return {
      success: true,
      message: "Email xác nhận thành công!"
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
