import db from "../config/database.config.js";
import jwt from "jsonwebtoken";
import slugify from "slugify";

db.raw("select now()")
  .then(r => console.log("✅ DB connected:", r.rows?.[0] || r))
  .catch(err => console.error("❌ DB connect error:", {
    code: err.code,
    message: err.message,
    address: err.address,
    port: err.port
  }));

export const findUserToEmail = async (email, role) => {
  const query = db("user").where("email", email);

  if (Array.isArray(role)) {
    query.whereIn("role", role);
  } else if (role) {
    query.where("role", role);
  }

  return query.first();
};

// export const findUserToEmailAndRole = (email, role) => {
//   const existUser = db('user').select('*').where({ email, role }).first();
//   return existUser;
// }

export const findUserById = async (id) => {
  const user = await db('user').select('*').where({ id_user: id }).first();
  return user;
};

export const getUserWatchList = async (id_user) => {
  const watchList = await db('watch_list')
    .select('id_product')
    .where({ id_user });

  return watchList.map(item => item.id_product);
}

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
    slug: slugify(fullname, { lower: true, strict: true, locale: 'vi' })
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

export const resetPassword = async (id_user, password) => {
  if (!id_user || !password) {
    throw new Error("Thiếu thông tin bắt buộc: id_user, password");
  }

  const [updatedUser] = await db("user")
    .where({ id_user })
    .update({ password })
    .returning(["id_user", "email", "fullname"]);

  if (!updatedUser) {
    throw new Error("Không tìm thấy người dùng để cập nhật mật khẩu");
  }

  return updatedUser;
};

export const getAllUsers = async (filter = {}) => {
  const users = db('user').select('id_user', 'fullname', 'email', 'date_of_birth', 'role', 'status');
  if (filter.page && filter.limit) {
    const offset = (filter.page - 1) * filter.limit;
    users.offset(offset).limit(filter.limit);
  }
  if (filter.keyword) {
    const regex = new RegExp(filter.keyword, "i");
    users.whereRaw("slug ~* ?", [regex.source]);
  }
  return users;
}

export const createVerifyEmail = async (id_user, role = "bidder") => {
  if (!id_user) {
    throw new Error("Thiếu thông tin bắt buộc: id_user");
  }

  const token = jwt.sign(
    {
      id_user: id_user,
      role: role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  const [record] = await db("verify_email")
    .insert({
      id_user,
      token: token,
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

export const deleteExpiredVerifyTokens = async () => {
  return db("verify_email")
    .where("expire_at", "<", db.raw("NOW()"))
    .del();
};

export const deleteExpiredForgotPasswordTokens = async () => {
  return db("forgot_password")
    .where("expire_at", "<", db.raw("NOW()"))
    .del();
}

export const deleteUserById = async (id) => {
  return db('user').where({ id_user: id }).del();
}

export const updateUserById = async (id, { fullname, date_of_birth, role }) => {
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

  const [updatedUser] = await db('user')
    .where({ id_user: id })
    .update(updateData)
    .returning(['id_user', 'fullname', 'slug', 'date_of_birth', 'role']);

  return updatedUser;
}