import { 
  handleRegister, 
  handleLogin, 
  handleVerifyToken, 
  handleForgotPassword, 
  handleOtpPassword, 
  handleResetPassword, 
  handleVerifyEmail 
} from "../../service/auth.service.js";

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

  const result = await handleLogin({ email, password, rememberPassword });
  
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

  const result = await handleForgotPassword(email);
  
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

  const result = await handleOtpPassword(email, otp);
  
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

  const result = await handleResetPassword(req.account.email, password);
  
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

  const result = await handleVerifyEmail(token, "client");
  
  if (!result.success) {
    return res.json({
      code: "error",
      message: result.message
    });
  }

  return res.sendFile(result.filePath);
};
