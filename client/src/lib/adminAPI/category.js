export const getCategoryList = async (params = "") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/list${params}`);

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh mục thất bại");
  }

  return data;
}

export const createCategory = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/create`, {
    method: "POST",
    body: JSON.stringify(finalData),
    headers: {
      "Content-Type": "application/json",
    }
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Tạo danh mục thất bại");
  }

  return data;
}

export const getTotalPage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/total-page`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy tổng số trang thất bại");
  }

  return data;
}

export const getDetailCategory = async (id) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/${id}`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy chi tiết danh mục thất bại");
  }

  return data;
}

export const updateCategory = async (id, finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Cập nhật chi tiết danh mục thất bại");
  }

  return data;
}