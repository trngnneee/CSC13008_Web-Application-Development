export const adminUserList = async (params) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/list${params}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách người dùng thất bại");
  }

  return data;
}

export const adminUserAdd = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Tạo người dùng thất bại");
  }

  return data;
}

export const adminUserTotalPage = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/total-page`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy tổng số trang người dùng thất bại");
  }

  return data;
}

export const adminUserDetail = async (id) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${id}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy thông tin người dùng thất bại");
  }

  return data;
}

export const adminUserUpdate = async (id, finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Cập nhật người dùng thất bại");
  }

  return data;
}

export const adminUserRequest = async (status) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/upgrade-requests/list` + (status ? `?status=${status}` : ""), {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách yêu cầu thất bại");
  }

  return data;
}