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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/add-time`, {
    method: "POST",
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      extend_threshold_minutes,
      extend_duration_minutes,
    }),
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Cập nhật thời gian gia hạn thất bại");
  }

  return data;
}

export const getAutoExtendSettings = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/auto-extend-settings`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Lấy cài đặt tự động gia hạn thất bại");
  }

  return data.data;
}