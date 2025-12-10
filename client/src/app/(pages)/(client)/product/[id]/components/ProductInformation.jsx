"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat, getRelativeEndTime } from "@/utils/date";
import { WishListButton } from "../../../components/WishlistButton";
import { placeBid } from "@/lib/clientAPI/bid";
import { toastHandler } from "@/lib/toastHandler";

export const ProdcutInformation = ({ productDetail }) => {
  const { isLogin, userInfo } = useClientAuthContext();
  const [bidPrice, setBidPrice] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  const handlePlaceBid = async () => {
    if (!bidPrice || Number(bidPrice) <= 0) {
      toastHandler("Vui lòng nhập số tiền đấu giá hợp lệ", "error");
      return;
    }

    if (!userInfo || !userInfo.id_user) {
      toastHandler("Vui lòng đăng nhập để đấu giá", "error");
      return;
    }

    setBidLoading(true);
    try {
      const result = await placeBid(productDetail.id_product, Number(bidPrice), userInfo.id_user);
      toastHandler("Đấu giá thành công", "success");
      setBidPrice("");
    } catch (error) {
      toastHandler(error.message, "error");
    } finally {
      setBidLoading(false);
    }
  };

  return (
    <>
      {productDetail && (
        <div className="relative w-1/2">
          <div className="w-[200px] h-[200px] overflow-hidden absolute -top-[50px] -left-[100px] z-5">
            <img
              src="/shape1.png"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="z-10 border-b-2 border-black pb-[30px]">
            <div className="text-[40px] font-extrabold  mb-6">{productDetail.name}</div>
            <div className="text-[20px] ">Người bán: <span className="font-extrabold">{productDetail.seller}</span></div>
            <div className="text-[20px]">Liên hệ: <span className="font-extrabold">{productDetail.seller_email}</span></div>
            <div className="flex items-center gap-5 mt-5">
              <div className="text-[15px] font-bold"><span className="">Giá khởi điểm:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.starting_price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Giá hiện tại:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Giá mua ngay:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.immediate_purchase_price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Bước giá:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.pricing_step).toLocaleString("vi-VN")}</span></div>
            </div>
    
            <div className="text-[15px] mt-[30px] font-bold">Thời điểm đăng: <span className="font-light">{dateTimeFormat(productDetail.posted_date_time)}</span></div>
            <div className="text-[15px] font-bold">Phiên đấu giá kết thúc tại: <span className="font-light">{productDetail.end_date_time ? dateTimeFormat(productDetail.end_date_time) : "-"}</span></div>
            {isLogin && (
              <div className="mt-[30px] flex justify-center">
                <WishListButton
                  onClickSuccess={(e) => {
                    e.stopPropagation();
                  }}
                  id={productDetail.id_product}
                  showTitle={true}
                />
              </div>
            )}
          </div>

          <div className="mt-[30px]">
            <div className="text-[20px] font-bold mb-[10px]">Đấu giá</div>
            <div className="flex items-center gap-5">
              <div><DollarSign /></div>
              <Input
                type="number"
                placeholder="Nhập số tiền đấu giá"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                disabled={!isLogin || bidLoading}
              />
              <Button 
                onClick={handlePlaceBid}
                disabled={!isLogin || bidLoading}
                className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/90 text-white"
              >
                {bidLoading ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}