import bcrypt from "bcryptjs";
import { supabase } from "../../config/database.config.js";

export const registerPost = async (req, res) => {
  const { fullName, email, password } = req.body;

  const { data: existAdmin, error: checkError } = await supabase
    .from('user')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existAdmin) {
    return res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const { data, error } = await supabase
    .from('user')
    .insert({
      fullname: fullName,
      email: email,
      password: hashPassword,
      date_of_birth: null,
      role: "admin",
      status: "initial"
    })
    .select()
    .single();

  if (error) {
    return res.json({
      code: "error",
      message: "Đăng ký thất bại: " + error.message
    });
  }

  res.json({
    code: "success",
    message: "Đăng ký thành công!"
  })
}