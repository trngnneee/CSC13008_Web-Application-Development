"use client"

import { Label } from "@/components/ui/label";
import { HeaderTitle } from "../../../components/HeaderTitle";
import TextEditor from "@/app/(pages)/admin/(dashboard)/components/TinyMCE";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clientProductGetDescription, clientProductUpdateDescription } from "@/lib/clientAPI/product";
import { useParams, useRouter } from "next/navigation";
import { toastHandler } from "@/lib/toastHandler";

export default function UpdateProductPage() {
  const [desc, setDesc] = useState("");
  const { id } = useParams();
  const router = useRouter();

  const [descHistory, setDescHistory] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientProductGetDescription(id);
      if (promise.code === "success") {
        setDescHistory(promise.descriptionHistory);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const promise = clientProductUpdateDescription(id, desc);
    toastHandler(promise, router, "/me/product");
  }

  return (
    <>
      <HeaderTitle title="Cập nhật thêm thông tin sản phẩm"  />
      <form onSubmit={handleSubmit}>
        <div className="mt-[30px]">
          <Label
            className="text-sm font-semibold text-[#606060]"
          >
            Lịch sử mô tả sản phẩm
          </Label>
          <div className="max-h-100 overflow-y-auto border border-gray-300 rounded-md p-3 mt-2">
            {descHistory.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có lịch sử mô tả.</div>
            ) : (
              descHistory.map((history, index) => (
                <div key={index} className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Thời gian: {new Date(history.time).toLocaleString()}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: history.description}}></div>
                  {index !== descHistory.length - 1 && <hr className="my-2" />}
                </div>
              ))
            )}
          </div>
        </div>
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