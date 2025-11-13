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