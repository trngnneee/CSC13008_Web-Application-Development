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