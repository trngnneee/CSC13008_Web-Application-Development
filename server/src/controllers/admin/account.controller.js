import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import {
  handleRegister,
  handleLogin,
  handleVerifyToken,
  handleForgotPassword,
  handleOtpPassword,
  handleResetPassword,
  handleVerifyEmail,
  handleChangeRole,
} from '../../services/auth.service.js';
import { getAllUsers } from '../../services/user.service.js';
import path from 'path';

export const register = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  const result = await handleRegister({ fullname, email, password }, 'admin');

  return res.json({
    code: result.success ? 'success' : 'error',
    message: result.message,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const result = await handleLogin({ email, password, rememberPassword }, 'admin');

  if (!result.success) {
    return res.json({ code: 'error', message: result.message });
  }

  res.cookie('adminToken', result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return res.json({ code: 'success', message: result.message });
});

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.cookies.adminToken;
  const result = await handleVerifyToken(token);

  if (!result.success) {
    if (token) res.clearCookie('adminToken');
    return res.json({ code: 'error', message: result.message });
  }

  return res.json({
    code: 'success',
    message: result.message,
    userInfo: result.user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await handleForgotPassword(req.body.email, 'admin');
  return res.json({
    code: result.success ? 'success' : 'error',
    message: result.message,
  });
});

export const otpPassword = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await handleOtpPassword(email, otp, 'admin');

  if (!result.success) {
    return res.json({ code: 'error', message: result.message });
  }

  res.cookie('adminToken', result.token, {
    maxAge: result.tokenMaxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return res.json({ code: 'success', message: result.message });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await handleResetPassword(req.account.id_user, req.body.password);
  return res.json({
    code: result.success ? 'success' : 'error',
    message: result.message,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await handleVerifyEmail(req.query.token);

  if (!result.success) {
    return res.json({ code: 'error', message: result.message });
  }

  const filePath = path.join(process.cwd(), 'public', 'change-direct-admin.html');
  return res.sendFile(filePath);
});

export const changeRole = asyncHandler(async (req, res) => {
  const result = await handleChangeRole(req.params.id_user, req.body.role);
  return res.json({
    code: result.success ? 'success' : 'error',
    message: result.message,
  });
});

export const getAllUsersList = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  if (!users) {
    return res.json({ code: 'error', message: 'Lấy danh sách người dùng thất bại' });
  }
  return res.json({
    code: 'success',
    message: 'Lấy danh sách người dùng thành công',
    data: users,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('adminToken');
  return res.json({ code: 'success', message: 'Đăng xuất thành công' });
});
