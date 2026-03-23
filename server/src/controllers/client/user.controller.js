import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as upgradeRequestService from '../../services/upgrade-request.service.js';
import * as userService from '../../services/user.service.js';
import { formatDate } from '../../utils/date.js';
import bcrypt from 'bcryptjs';
import db from '../../config/database.js';

export const requestUpgradeToSeller = asyncHandler(async (req, res) => {
  const { id_user, role } = req.account;

  if (role === 'admin') return errorResponse(res, { message: 'Admin không thể nâng cấp thành seller!' });
  if (role === 'seller') return errorResponse(res, { message: 'Bạn đã là seller rồi!' });

  const existingRequest = await upgradeRequestService.checkExistingRequest(id_user);
  if (existingRequest) return errorResponse(res, { message: 'Bạn đã có một yêu cầu nâng cấp đang chờ xử lý!' });

  const request = await upgradeRequestService.createUpgradeRequest(id_user);
  return successResponse(res, { message: 'Gửi yêu cầu nâng cấp thành công! Vui lòng chờ admin duyệt.', data: { data: request } });
});

export const getMyUpgradeRequest = asyncHandler(async (req, res) => {
  const request = await upgradeRequestService.checkExistingRequest(req.account.id_user);
  if (!request) return errorResponse(res, { message: 'Không có yêu cầu nâng cấp nào!', statusCode: 404 });

  return successResponse(res, { message: 'Lấy yêu cầu nâng cấp thành công!', data: { data: request } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, date_of_birth } = req.body;
  await userService.updateUserById(req.account.id_user, { fullname, date_of_birth: formatDate(date_of_birth) });
  return successResponse(res, { message: 'Cập nhật thông tin cá nhân thành công!' });
});

export const resetClientPassword = asyncHandler(async (req, res) => {
  const { old_password, password } = req.body;
  const existUser = await userService.findUserById(req.account.id_user);
  if (!existUser) return res.json({ code: 'error', message: 'Người dùng không tồn tại!' });

  if (!bcrypt.compareSync(old_password, existUser.password)) {
    return res.json({ code: 'error', message: 'Mật khẩu cũ không chính xác!' });
  }

  const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  await userService.resetPassword(req.account.id_user, hashPassword);
  return successResponse(res, { message: 'Đổi mật khẩu thành công!' });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { id_user } = req.account;
  const { id_product } = req.body;

  const existing = await db('watch_list').where({ id_user, id_product }).first();
  if (existing) return res.json({ code: 'error', message: 'Sản phẩm đã có trong danh sách yêu thích!' });

  await db('watch_list').insert({ id_user, id_product });
  return successResponse(res, { message: 'Thêm vào danh sách yêu thích thành công!' });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  await db('watch_list').where({ id_user: req.account.id_user, id_product: req.body.id_product }).del();
  return successResponse(res, { message: 'Xóa khỏi danh sách yêu thích thành công!' });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const { id_user } = req.account;
  const wishlistIDs = await db('watch_list').where({ id_user }).select('id_product');

  let productList = [];
  let totalPages = 0;
  const ids = wishlistIDs.map((entry) => entry.id_product);

  if (ids.length > 0) {
    const pageSize = 4;
    const countResult = await db('product').whereIn('id_product', ids).count('* as count').first();
    totalPages = Math.ceil(Number(countResult.count) / pageSize);

    const query = db('product')
      .select('product.*', 'user.fullname as seller')
      .join('user', 'product.created_by', 'user.id_user')
      .whereIn('product.id_product', ids);

    if (req.query.page) {
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * pageSize;
      query.limit(pageSize).offset(offset);
    }

    productList = await query;
  }

  return res.json({ code: 'success', message: 'Lấy danh sách yêu thích thành công!', productList, totalPages });
});

export const getFeedback = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const feedbacks = await db('rating')
    .select('rating.content', 'u.fullname', 'rating.rating_point')
    .join('user as u', 'rating.reviewer_id', 'u.id_user')
    .where('rating.reviewer_role', role)
    .orderBy('rating.created_at', 'desc');

  return res.json({ code: 'success', message: 'Lấy phản hồi thành công', data: feedbacks });
});

export const getFeedbackDetail = asyncHandler(async (req, res) => {
  const feedbacks = await db('rating')
    .select('rating.content', 'u.fullname', 'rating.rating_point')
    .join('user as u', 'rating.reviewer_id', 'u.id_user')
    .where('rating.reviewer_role', 'seller')
    .andWhere('rating.reviewee_id', req.params.id_user)
    .orderBy('rating.created_at', 'desc');

  return res.json({ code: 'success', message: 'Lấy phản hồi thành công', data: feedbacks });
});
