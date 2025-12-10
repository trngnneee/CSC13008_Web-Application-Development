export const placeBid = async (id_product, bid_price, id_user) => {
  const token = localStorage.getItem("clientToken");

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

  if (data.code !== "success") {
    throw new Error(data.message || "Đấu giá thất bại");
  }

  return data;
}
