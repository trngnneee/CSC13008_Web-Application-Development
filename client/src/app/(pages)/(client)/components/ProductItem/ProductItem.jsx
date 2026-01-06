"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat, getRelativeEndTime } from "@/utils/date";
import Link from "next/link";
import { WishListButton } from "../WishlistButton";
import { Badge } from "@/components/ui/badge";

export const ProductItem = ({ item }) => {
  const router = useRouter();
  const { isLogin } = useClientAuthContext();

  // Tính toán sản phẩm mới đăng trong 60 phút
  const isNewProduct = (() => {
    const posted = new Date(item.posted_date_time).getTime();
    const now = Date.now();
    const diffMinutes = (now - posted) / (1000 * 60);
    return diffMinutes <= 60;
  })();

  return (
    <div onClick={() => {
      router.push(`/product/${item.id_product}`);
    }}>
      <div
        className={`
          relative p-5 bg-white rounded-[10px] transition-all duration-300 cursor-pointer shadow-2xl hover:scale-[1.02]
          ${isNewProduct ? "border-2 border-[var(--main-client-color)] shadow-[0_0_15px_rgba(0,70,99,0.6)]" : ""}
        `}
      >
        {isNewProduct && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md z-10">
            MỚI ĐĂNG
          </Badge>
        )}

        <div className="w-full h-[200px] overflow-hidden">
          <img
            src={item.avatar}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-[23px]">
          <div className="text-[18px] font-bold min-h-[72px] line-clamp-3">{item.name}</div>
          <div className="text-[15px]">by: <span className="font-bold">{item.seller}</span></div>
        </div>

        <div className="text-[12px] mt-[20px]">
          Giá hiện tại: <span className="font-bold">{parseInt(item.price).toLocaleString("vi-VN")} VND</span>
        </div>

        <div className="text-[12px] border-b border-b-[black] pb-2.5 mb-2.5">
          Giá mua ngay: <span className="font-bold">{parseInt(item.immediate_purchase_price).toLocaleString("vi-VN")} VND</span>
        </div>

        <div className="text-[10px] flex items-center gap-[5px] mb-2">
          <div className="w-4 h-4 rounded-full bg-amber-400"></div>
          <div>Thời gian đăng: <span className="font-bold">{dateTimeFormat(item.posted_date_time)}</span></div>
        </div>

        <div className="text-[10px] flex items-center gap-[5px]">
          <div className="w-4 h-4 rounded-full bg-amber-400"></div>
          <div>Kết thúc: <span className="font-bold">{item.end_date_time ? getRelativeEndTime(item.end_date_time) : "-"}</span></div>
        </div>

        {isLogin ? (
          <div className="flex items-center mt-[30px] gap-2.5">
            <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">Đấu giá</Button>
            <WishListButton
              onClickSuccess={(e) => {
                e.stopPropagation()
              }}
              id={item.id_product}
            />
          </div>
        ) : (
          <div className="mt-[30px] text-sm bg-[var(--main-client-color)] text-white px-2 py-1 rounded-[8px] text-center">
            Vui lòng đăng nhập để đấu giá
          </div>
        )}
      </div>
    </div>
  )
}