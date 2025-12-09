export const clientUpgrade = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/request-upgrade`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Yêu cầu nâng cấp thành Seller thất bại");
  }

  return data;
}

export const clientProfileUpdate = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Cập nhật thông tin cá nhân thất bại");
  }

  return data;
}

export const clientProfileResetPassword = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Đặt lại mật khẩu thất bại");
  }

  return data;
}