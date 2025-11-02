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
