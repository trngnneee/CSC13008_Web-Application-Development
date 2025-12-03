export const clientRegister = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Đăng ký thất bại");
  }

  return data;
}
  
export const clientLogin = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Đăng nhập thất bại");
  }

  return data;
}

export const clientForgotPassword = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Quên mật khẩu thất bại");
  }

  return data;
}

export const clientOTPPassword = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/otp-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Xác thực OTP thất bại");
  }

  return data;
}

export const clientResetPassword = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Đổi mật khẩu thất bại");
  }

  return data;
}