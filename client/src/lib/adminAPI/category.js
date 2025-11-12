export const categoryImport = async (formData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/upload-csv`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Import danh mục thất bại");
  }

  return data;
}

export const getCategoryList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/list`);

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Lấy danh mục thất bại");
  }

  return data;
}

export const createCategory = async (finalData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category/create`, {
    method: "POST",
    body: JSON.stringify(finalData),
    headers: {
      "Content-Type": "application/json",
    }
  });

  const data = await res.json();

  if (!res.ok || data.code !== "success") {
    throw new Error(data.message || "Tạo danh mục thất bại");
  }

  return data;
}