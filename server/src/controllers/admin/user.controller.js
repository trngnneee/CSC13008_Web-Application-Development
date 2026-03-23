import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as userService from '../../services/user.service.js';
import { sendResetPasswordMail } from '../../services/mail.service.js';

export const getUserList = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.page) {
    filter.page = parseInt(req.query.page);
    filter.limit = 5;
  }
  if (req.query.keyword) {
    filter.keyword = req.query.keyword;
  }

  const users = await userService.getAllUsers(filter);
  return res.json({
    code: 'success',
    message: 'Lấy danh sách người dùng thành công!',
    data: users,
  });
});

export const getTotalPage = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return res.json({
    code: 'success',
    message: 'Lấy tổng số trang người dùng thành công!',
    data: Math.ceil(users.length / 5),
  });
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await userService.findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy người dùng!' });
  }

  return res.json({
    code: 'success',
    message: 'Lấy chi tiết người dùng thành công!',
    data: {
      id_user: user.id_user,
      fullname: user.fullname,
      email: user.email,
      date_of_birth: user.date_of_birth,
      role: user.role,
      status: user.status,
    },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, date_of_birth, role } = req.body;

  const user = await userService.findUserById(id);
  if (!user) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy người dùng!' });
  }

  await userService.updateUserById(id, { fullname, date_of_birth, role });
  return res.json({ code: 'success', message: 'Cập nhật người dùng thành công!' });
});

export const createUser = asyncHandler(async (req, res) => {
  const existUser = await userService.findUserByEmail(req.body.email, req.body.role);
  if (existUser) {
    return res.status(400).json({ code: 'error', message: 'Người dùng với email và vai trò này đã tồn tại!' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(req.body.password, salt);

  await userService.addUser({
    fullname: req.body.fullname,
    email: req.body.email,
    password: hashPassword,
    date_of_birth: req.body.date_of_birth,
    role: req.body.role,
    status: 'active',
  });

  return res.json({ code: 'success', message: 'Tạo người dùng thành công!' });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy người dùng!' });
  }

  await userService.deleteUserById(req.params.id);
  return res.json({ code: 'success', message: 'Xóa người dùng thành công!' });
});

export const deleteUserList = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  for (const id of ids) {
    const user = await userService.findUserById(id);
    if (user) {
      await userService.deleteUserById(id);
    }
  }

  return res.json({ code: 'success', message: 'Xóa danh sách người dùng thành công!' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await userService.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy người dùng!' });
  }

  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 4; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  };

  const newPassword = generateSecurePassword();
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(newPassword, salt);

  await userService.updateUserById(req.params.id, { password: hashPassword });
  await sendResetPasswordMail(user.email, newPassword);

  return res.json({
    code: 'success',
    message: 'Đặt lại mật khẩu thành công! Email đã được gửi đến người dùng.',
  });
});
