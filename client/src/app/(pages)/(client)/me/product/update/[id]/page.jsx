"use client"

import { Label } from "@/components/ui/label";
import { HeaderTitle } from "../../../components/HeaderTitle";
import TextEditor from "@/app/(pages)/admin/(dashboard)/components/TinyMCE";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function UpdateProductPage() {
  const [desc, setDesc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted description:", desc);
  }

  return (
    <>
      <HeaderTitle title="Cập nhật thêm thông tin sản phẩm"  />
      <form onSubmit={handleSubmit}>
        <div className="mt-[30px] flex flex-col gap-3">
          <Label
            htmlFor="desc"
            className="text-sm font-semibold text-[#606060]"
          >
            Mô tả sản phẩm
          </Label>
          <TextEditor
            content={desc}
            setContent={setDesc}
          />
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] w-full font-bold text-lg">Lưu</Button>
          <Link href="/me/product" className="text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  )
}