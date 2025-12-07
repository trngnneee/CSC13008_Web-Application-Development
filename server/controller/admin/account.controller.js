import { 
  handleRegister, 
  handleLogin, 
  handleVerifyToken, 
  handleForgotPassword, 
  handleOtpPassword, 
  handleResetPassword, 
  handleVerifyEmail, 
  handleChangeRole 
} from "../../service/auth.service.js";
import { findUserToEmail } from "../../service/user.service.js";
import path from "path";

export const registerPost = async (req, res) => {
  const { fullname, email, password } = req.body;
  
  const result = await handleRegister({ fullname, email, password }, "admin");
  
  if (result.success) {
    return res.json({
      code: "success",
      message: result.message
    });
  }
  
  return res.json({
    code: "error",
    message: result.message
  });
}

export const loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  const result = await handleLogin({ email, password, rememberPassword }, "admin");
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  res.cookie("adminToken", result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.json({
    code: "success",
    message: result.message
  });
}

export const verifyTokenGet = async (req, res) => {
  try {
    const token = req.cookies.adminToken;
    
    const result = await handleVerifyToken(token);
    
    if (!result.success) {
      if (token) res.clearCookie("adminToken");
      return res.json({
        code: "error",
        message: result.message
      });
    }

    res.json({
      code: "success",
      message: result.message,
      userInfo: result.user
    });
  } catch (error) {
    res.json({
      code: "error",
      message: error.message || "Xác thực token thất bại!"
    });
  }
}

export const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  const result = await handleForgotPassword(email, "admin");
  
  if (result.success) {
    return res.json({
      code: "success",
      message: result.message
    });
  }
  
  return res.json({
    code: "error",
    message: result.message
  });
}

export const otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;

  const result = await handleOtpPassword(email, otp, "admin");
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  res.cookie("adminToken", result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.json({
    code: "success",
    message: result.message
  });
}

export const resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  const result = await handleResetPassword(req.account.id_user, password);
  
  if (result.success) {
    return res.json({
      code: "success",
      message: result.message
    });
  }
  
  return res.json({
    code: "error",
    message: result.message
  });
}

export const verifyEmailGet = async (req, res) => {
  const { token } = req.query;

  const result = await handleVerifyEmail(token);
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  const filePath = path.join(process.cwd(), "public", "change-direct-admin.html");
  return res.sendFile(filePath);
};

export const changeRolePatch = async (req, res) => {
  const { id_user } = req.params;
  const { role } = req.body;

  const result = await handleChangeRole(id_user, role);
  
  if (result.success) {
    return res.json({
      code: "success",
      message: result.message
    });
  }

  return res.json({
    code: "error",
    message: result.message
  });
}

export const getAllUsersGet = async (req, res) => {
  const users = await getAllUsers();
  if (!users) {
    return res.json({
      code: "error",
      message: "Lấy danh sách người dùng thất bại"
    });
  }
  
  res.json({
    code: "success",
    message: "Lấy danh sách người dùng thành công",
    data: users
  });
};

export const logoutGet = async (req, res) => {
  res.clearCookie("adminToken");
  res.json({
    code: "success",
    message: "Đăng xuất thành công"
  });
}