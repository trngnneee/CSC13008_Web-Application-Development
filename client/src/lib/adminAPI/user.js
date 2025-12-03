export const adminUserList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/list`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách người dùng thất bại");
  }

  return data;
}