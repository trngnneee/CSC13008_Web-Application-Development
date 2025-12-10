export const productImport = async (formData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/upload-csv`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Import sản phẩm thất bại");
  }

  return data;
}

export const productList = async (params = "") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/list${params}`);

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm thất bại");
  }

  return data;
}

export const productTotalPage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/total-page`);

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy tổng số trang sản phẩm thất bại");
  }

  return data;
}

export const addTimeToAllProducts = async (extend_threshold_minutes, extend_duration_minutes) => {
  const token = localStorage.getItem("adminToken");
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/add-time`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include", 
    body: JSON.stringify({
      extend_threshold_minutes,
      extend_duration_minutes,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Cập nhật thời gian gia hạn thất bại");
  }

  return data;
}