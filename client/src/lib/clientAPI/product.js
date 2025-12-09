export const clientProductList = async (limit = 0) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list${limit != 0 ? `?limit=${limit}` : ""}`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm thất bại");
  }

  return data;
}

export const clientProductDetail = async (id) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/detail/${id}`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy chi tiết sản phẩm thất bại");
  }

  return data;
}

export const clientProductCreate = async (formData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/create`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Tạo sản phẩm thất bại");
  }

  return data;
}

export const clientProductListBySeller = async (id, params = "") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list/seller/${id}${params}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm của người bán thất bại");
  }

  return data;
}