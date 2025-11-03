import db from "../config/database.config.js";

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
