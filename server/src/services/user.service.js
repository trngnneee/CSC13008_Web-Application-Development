import db from '../config/database.js';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';

export const findUserByEmail = async (email, role) => {
  const query = db('user').where('email', email);
  if (Array.isArray(role)) {
    query.whereIn('role', role);
  } else if (role) {
    query.where('role', role);
  }
  return query.first();
};

export const findUserById = async (id) => {
  return db('user').where({ id_user: id }).first();
};

export const getUserWatchList = async (id_user) => {
  const watchList = await db('watch_list').select('id_product').where({ id_user });
  return watchList.map((item) => item.id_product);
};

export const getUserPoint = async (id_user) => {
  const userpoint = await db('user_point').where({ id_user }).first('judge_point');
  return userpoint ? userpoint.judge_point : 0;
};

export const getUserFeedbackList = async (id_user) => {
  return db('rating')
    .select('rating.*', 'reviewer.fullname as reviewer_name', 'product.name as product_name')
    .leftJoin('user as reviewer', 'rating.reviewer_id', 'reviewer.id_user')
    .leftJoin('product', 'rating.id_product', 'product.id_product')
    .where('rating.reviewee_id', id_user)
    .orderBy('rating.created_at', 'desc');
};

export const addUser = async ({ fullname, email, password, date_of_birth = null, role, status }) => {
  const [insertedUser] = await db('user')
    .insert({
      fullname,
      email,
      password,
      date_of_birth,
      role,
      status,
      slug: slugify(fullname, { lower: true, strict: true, locale: 'vi' }),
    })
    .returning(['id_user', 'fullname', 'email', 'date_of_birth', 'role', 'status']);

  return insertedUser;
};

export const saveOTP = async ({ email, otp }) => {
  await db('forgot_password').where({ email }).del();
  const [record] = await db('forgot_password')
    .insert({
      email,
      otp,
      expire_at: db.raw(`NOW() + INTERVAL '5 minutes'`),
    })
    .returning(['id', 'email', 'expire_at']);
  return record;
};

export const verifyOTP = async ({ email, otp }) => {
  const record = await db('forgot_password')
    .where({ email })
    .andWhere('expire_at', '>', db.fn.now())
    .orderBy('expire_at', 'desc')
    .first();

  if (!record) {
    return { success: false, message: 'Mã OTP đã hết hạn hoặc không tồn tại.' };
  }

  if (record.otp === otp) {
    await db('forgot_password').where({ id: record.id }).del();
    return { success: true, message: 'Xác thực OTP thành công.' };
  }

  return { success: false, message: 'Mã OTP không chính xác.' };
};

export const resetPassword = async (id_user, password) => {
  const [updatedUser] = await db('user')
    .where({ id_user })
    .update({ password })
    .returning(['id_user', 'email', 'fullname']);
  return updatedUser;
};

export const resetPasswordByEmail = async (email, password) => {
  const [updatedUser] = await db('user')
    .where({ email })
    .update({ password })
    .returning(['id_user', 'email', 'fullname']);
  return updatedUser;
};

export const getAllUsers = async (filter = {}) => {
  const query = db('user')
    .select('id_user', 'fullname', 'email', 'date_of_birth', 'role', 'status')
    .where('status', '!=', 'inactive');

  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    query.offset(offset).limit(filter.limit);
  }
  if (filter.keyword) {
    query.whereRaw('slug ~* ?', [filter.keyword]);
  }
  return query;
};

export const createVerifyEmail = async (id_user, role = 'bidder') => {
  const token = jwt.sign({ id_user, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  await db('verify_email')
    .insert({
      id_user,
      token,
      expire_at: db.raw(`NOW() + INTERVAL '5 minutes'`),
    })
    .returning(['id', 'id_user', 'token', 'expire_at']);

  return token;
};

export const findVerifyEmailToken = async (token) => {
  return db('verify_email')
    .where({ token, used: false })
    .andWhere('expire_at', '>', db.fn.now())
    .first();
};

export const markVerifyTokenUsed = async (id_user) => {
  await db('verify_email').where({ id_user }).update({ used: true });
  await db('user').where({ id_user }).update({ status: 'active' });
};

export const changeUserRole = async (id_user, role) => {
  const [updatedUser] = await db('user')
    .where({ id_user })
    .update({ role })
    .returning(['id_user', 'email', 'fullname', 'role']);
  return updatedUser;
};

export const downgradeExpiredSellers = async () => {
  const expiredSellers = await db('upgrade_request')
    .join('user', 'upgrade_request.id_user', 'user.id_user')
    .where('user.role', 'seller')
    .where('upgrade_request.status', 'approved')
    .where('upgrade_request.expires_at', '<', db.raw('NOW()'))
    .select('user.id_user', 'upgrade_request.id_request');

  if (expiredSellers.length === 0) return 0;

  const userIds = expiredSellers.map((s) => s.id_user);
  const requestIds = expiredSellers.map((s) => s.id_request);

  await db('user').whereIn('id_user', userIds).update({ role: 'bidder' });
  await db('upgrade_request').whereIn('id_request', requestIds).update({ status: 'expired' });

  return expiredSellers.length;
};

export const deleteExpiredVerifyTokens = async () => {
  return db('verify_email').where('expire_at', '<', db.raw('NOW()')).del();
};

export const deleteExpiredForgotPasswordTokens = async () => {
  return db('forgot_password').where('expire_at', '<', db.raw('NOW()')).del();
};

export const deleteUserById = async (id) => {
  return db('user').where({ id_user: id }).update({ status: 'inactive' });
};

export const updateUserById = async (id, { fullname, date_of_birth, role, password }) => {
  const user = await db('user').where({ id_user: id }).first();
  if (!user) return null;

  const updateData = {};
  if (fullname !== undefined && fullname !== null) {
    updateData.fullname = fullname.trim();
    updateData.slug = slugify(fullname, { lower: true, strict: true, locale: 'vi' });
  }
  if (date_of_birth !== undefined && date_of_birth !== null) {
    updateData.date_of_birth = date_of_birth;
  }
  if (role !== undefined && role !== null) {
    updateData.role = role;
  }
  if (password !== undefined && password !== null) {
    updateData.password = password;
  }

  const [updatedUser] = await db('user')
    .where({ id_user: id })
    .update(updateData)
    .returning(['id_user', 'fullname', 'slug', 'date_of_birth', 'role']);

  return updatedUser;
};
