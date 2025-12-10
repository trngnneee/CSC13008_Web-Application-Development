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

export const clientProductListTopPrice = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list/top-price`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm thất bại");
  }

  return data;
}

export const clientProductListEndingSoon = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list/ending-soon`, {
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

export const clientProductSearch = async (keyword, status = "") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?keyword=${encodeURIComponent(keyword)}` + (status != "normal" ? `&status=${encodeURIComponent(status)}` : ""), {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Tìm kiếm sản phẩm thất bại");
  }
  return data;
}

export const clientProductListByCategory = async (categoryID, params = "", status = "normal",) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list-category/${categoryID}${params}` + (status != "normal" ? `&status=${encodeURIComponent(status)}` : ""), {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm thất bại");
  }
  return data;;
}

export const clientProductUpdateDescription = async (id, description) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/update/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ description }),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Cập nhật mô tả sản phẩm thất bại");
  }
  return data;
}

export const clientProductGetDescription = async (id) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/description-history/${id}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy lịch sử mô tả sản phẩm thất bại");
  }
  return data;
}