import { 
  handleRegister, 
  handleLogin, 
  handleVerifyToken, 
  handleForgotPassword, 
  handleOtpPassword, 
  handleResetPassword, 
  handleVerifyEmail 
} from "../../service/auth.service.js";
import path from "path";

export const registerPost = async (req, res) => {
  const { fullname, email, password } = req.body;
  
  const result = await handleRegister({ fullname, email, password }, "bidder");
  
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
};

export const loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  const result = await handleLogin({ email, password, rememberPassword }, ["bidder", "seller"]);
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  res.cookie("clientToken", result.token, {
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
};

export const verifyTokenGet = async (req, res) => {
  try {
    const token = req.cookies.clientToken;
    
    const result = await handleVerifyToken(token);
    
    if (!result.success) {
      if (token) res.clearCookie("clientToken");
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
};

export const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  const result = await handleForgotPassword(email, "bidder");
  
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
};

export const otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;

  const result = await handleOtpPassword(email, otp, "bidder");
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  res.cookie("clientToken", result.token, {
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
};

export const resetPasswordPost = async (req, res) => {
  const { password } = req.body;
  const id_user = req.account?.id_user;

  if (!id_user) {
    return res.json({
      code: "error",
      message: "Thông tin tài khoản không hợp lệ!"
    });
  }

  if (!password) {
    return res.json({
      code: "error",
      message: "Mật khẩu không được để trống!"
    });
  }

  const result = await handleResetPassword(id_user, password);
  
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
};

export const verifyEmailGet = async (req, res) => {
  const { token } = req.query;

  const result = await handleVerifyEmail(token);
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  const filePath = path.join(process.cwd(), "public", "change-direct-client.html");
  return res.sendFile(filePath);
};
