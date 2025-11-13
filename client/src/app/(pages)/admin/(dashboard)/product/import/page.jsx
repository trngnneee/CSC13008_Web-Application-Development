"use client"

import { DashboardTitle } from "../../components/DashboardTitle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { toastHandler } from "@/lib/toastHandler";
import { useRouter } from "next/navigation";
import { CSVUploader } from "./components/CSVUploader";
import { productImport } from "@/lib/adminAPI/product";

export default function AdminCategoryImport() {
  const [file, setFile] = useState([]);
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    if (file.length > 0) {
      formData.append("file", file[0]);
    }

    const promise = productImport(formData);
    toastHandler(promise, router, "/admin/product");
  }

  return (
    <>
      <DashboardTitle title="Import dữ liệu sản phẩm" />
      <form onSubmit={handleSubmit} className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
        <div className="flex flex-col gap-2 mt-[30px]">
          <CSVUploader
            value={file}
            onChange={setFile}
            maxFiles={1}
          />
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Import file này</Button>
          <Link href="/admin/product" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}