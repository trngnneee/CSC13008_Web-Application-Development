import {
  handleRegister,
  handleLogin,
  handleVerifyToken,
  handleForgotPassword,
  handleOtpPassword,
  handleResetPassword,
  handleVerifyEmail,
} from '../../services/auth.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';
import path from 'path';

export const register = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  const result = await handleRegister({ fullname, email, password }, 'bidder');

  return res.json({
    code: result.success ? 'success' : 'error',
    message: result.message,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const result = await handleLogin({ email, password, rememberPassword }, ['bidder', 'seller']);

  if (!result.success) {
    return res.json({ code: 'error', message: result.message });
  }

  res.cookie('clientToken', result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return res.json({ code: 'success', message: result.message });
});

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.cookies.clientToken;
  const result = await handleVerifyToken(token);

  if (!result.success) {
    if (token) res.clearCookie('clientToken');
    return res.json({ code: 'error', message: result.message });
  }

  return res.json({ code: 'success', message: result.message, userInfo: result.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await handleForgotPassword(req.body.email, ['bidder', 'seller']);
  return res.json({ code: result.success ? 'success' : 'error', message: result.message });
});

export const otpPassword = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await handleOtpPassword(email, otp, ['bidder', 'seller']);

  if (!result.success) return res.json({ code: 'error', message: result.message });

  res.cookie('clientToken', result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return res.json({ code: 'success', message: result.message });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const id_user = req.account?.id_user;
  if (!id_user) return res.json({ code: 'error', message: 'Thông tin tài khoản không hợp lệ!' });
  if (!req.body.password) return res.json({ code: 'error', message: 'Mật khẩu không được để trống!' });

  const result = await handleResetPassword(id_user, req.body.password);
  return res.json({ code: result.success ? 'success' : 'error', message: result.message });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await handleVerifyEmail(req.query.token);
  if (!result.success) return res.json({ code: 'error', message: result.message });

  const filePath = path.join(process.cwd(), 'public', 'change-direct-client.html');
  return res.sendFile(filePath);
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('clientToken');
  return successResponse(res, { message: 'Đăng xuất thành công!' });
});
