"use client"

import { Button } from "@/components/ui/button"
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat } from "@/utils/date";
import { Heart } from "lucide-react";
import Link from "next/link";

export const ProductItem = ({ item }) => {
  const { isLogin } = useClientAuthContext();

  return (
    <>
      <Link href={`/product/${item.id_product}`}>
        <div className="p-5 bg-white shadow-2xl rounded-[10px] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="w-full h-[200px] overflow-hidden">
            <img
              src={item.image}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-[23px]">
            <div className="text-[30px] font-bold line-clamp-1">{item.name}</div>
            <div className="text-[15px]">by: <span className="font-bold">{item.seller}</span></div>
          </div>
          <div className="text-[16px] mt-[30px] border-b border-b-[black] pb-[10px] mb-[10px]">Giá hiện tại: $<span className="font-bold">{parseInt(item.price).toLocaleString("vi-VN")}</span></div>
          <div className="text-[10px] flex items-center gap-[5px]">
            <div className="w-4 h-4 rounded-full bg-amber-400"></div>
            <div>Kết thúc tại: <span className="font-bold">{dateTimeFormat(item.end_date_time)}</span></div>
          </div>
          {isLogin ? (
            <div className="flex items-center mt-[30px] gap-2.5">
              <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">Đấu giá</Button>
              <Button className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] rounded-full text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] w-10 h-10 flex items-center justify-center cursor-pointer">
                <Heart />
              </Button>
            </div>
          ) : (
            <div className="mt-[30px] text-sm bg-[var(--main-client-color)] text-white px-2 py-1 rounded-[8px] text-center">Vui lòng đăng nhập để đấu giá</div>
          )}
        </div>
      </Link>
    </>
  )
}