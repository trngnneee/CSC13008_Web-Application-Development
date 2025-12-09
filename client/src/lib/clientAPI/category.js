export const clientCategoryList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/list`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách danh mục thất bại");
  }

  return data;
}

export const clientCategoryTree = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/tree-list`, {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách danh mục thất bại");
  }

  return data;
}

export const clientParentList = async (params = "") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/parent-list` + (params ? `?${params}` : ""), {
    method: "GET"
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh sách danh mục thất bại");
  }

  return data;
}