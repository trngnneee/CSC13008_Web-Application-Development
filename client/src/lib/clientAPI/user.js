export const clientUpgrade = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/request-upgrade`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Yêu cầu nâng cấp thành Seller thất bại");
  }

  return data;
}