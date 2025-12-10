import { toast } from "sonner";

export const commentRootCreate = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/create/root`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    toast.error(data.message || "Gửi bình luận thất bại");
  }
  return data;
}

export const commentRootListToProduct = async (id) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/list/${id}`, {
    method: "GET"
  });
  
  const data = await res.json();
  
  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách bình luận thất bại");
  }
  return data;
}

export const commentReplyCreate = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/create/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    toast.error(data.message || "Gửi phản hồi thất bại");
  }
  return data;
}