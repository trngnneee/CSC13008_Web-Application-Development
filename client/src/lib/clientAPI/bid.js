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

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();

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

export const getMyBiddingProducts = async () => {
  const token = localStorage.getItem("clientToken");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/my-bidding`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách sản phẩm đang đấu giá thất bại");
  }

  return data;
}

export const getBidderListByProduct = async (id_product) => {
  const token = localStorage.getItem("clientToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/product/${id_product}/bidders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách người đấu giá thất bại");
  }
  return data;
}

export const kickBidderFromProduct = async (id_product, id_bidder) => {
  const token = localStorage.getItem("clientToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/product/${id_product}/kick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_product, id_bidder }),
  });
  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Kick người đấu giá thất bại");
  } 
  return data;
}

export const recoverBidderFromProduct = async (id_product, id_bidder) => {
  const token = localStorage.getItem("clientToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/product/${id_product}/recover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_product, id_bidder }),
  });
  const data = await res.json();
  if (data.code !== "success") {
    throw new Error(data.message || "Phục hồi người đấu giá thất bại");
  }

  return data;
}
// =====================================================
// AUTO-BID API FUNCTIONS
// =====================================================

/**
 * Place or update auto-bid for a product
 */
export const placeAutoBid = async (id_product, max_bid) => {
  const token = localStorage.getItem("clientToken");
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/auto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    body: JSON.stringify({ id_product, max_bid }),
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Đặt auto-bid thất bại");
  }

  return data;
}

/**
 * Get user's auto-bid for a product
 */
export const getAutoBid = async (id_product) => {
  const token = localStorage.getItem("clientToken");
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/auto/${id_product}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Lấy thông tin auto-bid thất bại");
  }

  return data;
}

/**
 * Delete user's auto-bid for a product
 */
export const deleteAutoBid = async (id_product) => {
  const token = localStorage.getItem("clientToken");
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bid/auto/${id_product}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  const data = await res.json();

  if (data.code !== "success") {
    throw new Error(data.message || "Xóa auto-bid thất bại");
  }

  return data;
}