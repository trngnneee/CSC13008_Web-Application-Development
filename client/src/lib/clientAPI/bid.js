export const placeBid = async (id_product, bid_price, id_user) => {
  const token = localStorage.getItem("clientToken");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      credentials: "include",
      body: JSON.stringify({
        id_product,
        bid_price,
        id_user,
      }),
    });

    const data = await res.json();

    // "success" hoặc "pending_approval" đều là kết quả hợp lệ
    if (data.code !== "success" && data.code !== "pending_approval") {
      throw new Error(data.message || "Đấu giá thất bại");
    }

    return data;
  } catch (error) {
    // Nếu error đã có message từ backend, throw lại
    if (error.message && error.message !== "Failed to fetch") {
      throw error;
    }
    // Network error hoặc lỗi khác
    throw new Error("Lỗi kết nối. Vui lòng thử lại");
  }
}

export const getBidRequests = async () => {
  const token = localStorage.getItem("clientToken");
  
  console.log("=== getBidRequests API CALL ===");
  console.log("Token:", token ? "exists" : "missing");
  console.log("URL:", `${process.env.NEXT_PUBLIC_API_URL}/product/bid`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  console.log("Response status:", res.status);
  const data = await res.json();
  console.log("Response data:", data);

  if (data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách yêu cầu thất bại");
  }

  return data;
}

export const approveBidRequest = async (id_request) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_request }),
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Phê duyệt thất bại");
  }

  return data;
}

export const rejectBidRequest = async (id_request) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_request }),
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Từ chối thất bại");
  }

  return data;
}

export const getBidRequestsByProduct = async (id_product) => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/product/${id_product}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data;
}
