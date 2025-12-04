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