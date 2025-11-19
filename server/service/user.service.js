import db from "../config/database.config.js";

//Import lib
import crypto from "crypto";

db.raw("select now()")
  .then(r => console.log("✅ DB connected:", r.rows?.[0] || r))
  .catch(err => console.error("❌ DB connect error:", {
    code: err.code,
    message: err.message,
    address: err.address,
    port: err.port
  }));

export const findUserToEmail = async (email) => {
  const existUser = db('user').select('*').where({ email }).first();
  return existUser;
};

export const addUser = async ({ fullname, email, password, date_of_birth = null, role, status }) => {
  if (!fullname || !email || !password || !role || !status) {
    throw new Error('Thiếu thông tin bắt buộc: fullname, email, password, role, status');
  }

  const newUser = {
    fullname,
    email,
    password,
    date_of_birth,
    role,
    status: status,
  };

  const [insertedUser] = await db('user')
    .insert(newUser)
    .returning(['id_user', 'fullname', 'email', 'date_of_birth', 'role', 'status']);

  return insertedUser;
};

export const saveOTP = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error('Thiếu thông tin bắt buộc: email, otp');
  }

  await db('forgot_password').where({ email }).del();

  const [record] = await db('forgot_password')
    .insert({
      email,
      otp,
      expire_at: db.raw(`NOW() + INTERVAL '5 minutes'`)
    })
    .returning(['id', 'email', 'expire_at']);

  return record;
}

export const verifyOTP = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error("Thiếu thông tin bắt buộc: email, otp");
  }

  const record = await db("forgot_password")
    .where({ email })
    .andWhere("expire_at", ">", db.fn.now())
    .orderBy("expire_at", "desc")
    .first();

  if (!record) {
    return { success: false, message: "Mã OTP đã hết hạn hoặc không tồn tại." };
  }

  if (record.otp === otp) {
    await db("forgot_password").where({ id: record.id }).del();

    return { success: true, message: "Xác thực OTP thành công." };
  } else {
    return { success: false, message: "Mã OTP không chính xác." };
  }
};

export const resetPassword = async (email, password) => {
  if (!email || !password) {
    throw new Error("Thiếu thông tin bắt buộc: email, password");
  }

  const [updatedUser] = await db("user")
    .where({ email })
    .update({ password })
    .returning(["id_user", "email", "fullname"]);

  if (!updatedUser) {
    throw new Error("Không tìm thấy người dùng để cập nhật mật khẩu");
  }

  return updatedUser;
};

export const getAllUsers = async () => {
  const users = await db('user').select('id_user', 'fullname', 'email', 'date_of_birth', 'role', 'status');
  return users;
}

export const createVerifyEmail = async (id_user) => {
  if (!id_user) {
    throw new Error("Thiếu thông tin bắt buộc: id_user");
  }

  const verifyToken = crypto.randomBytes(32).toString("hex") + id_user;
  
  const [record] = await db("verify_email")
    .insert({
      id_user,
      token: verifyToken,
      expire_at: db.raw(`NOW() + INTERVAL '5 minutes'`)
    })
    .returning(['id', 'id_user', 'token', 'expire_at']);

  return record.token;
}

export const findVerifyEmailToken = async (token) => {
  if (!token) throw new Error("Thiếu token");

  const record = await db("verify_email")
    .where({ token, used: false })
    .andWhere("expire_at", ">", db.fn.now())
    .first();

  return record;
};

export const markVerifyTokenUsed = async (id) => {
  await db("verify_email")
    .where({ id_user: id })
    .update({ used: true });

  await db("user")
    .where({ id_user: id })
    .update({ status: 'active' });
};

export const changeUserRole = async (id_user, role) => {
  if (!id_user || !role) {
    throw new Error("Thiếu thông tin bắt buộc: id_user, role");
  }

  const [updatedUser] = await db("user")
    .where({ id_user })
    .update({ role })
    .returning(["id_user", "email", "fullname", "role"]);

  if (!updatedUser) {
    throw new Error("Không tìm thấy người dùng để cập nhật vai trò");
  }

  return updatedUser;
}