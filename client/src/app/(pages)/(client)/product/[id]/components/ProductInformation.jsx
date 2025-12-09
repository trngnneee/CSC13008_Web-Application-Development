"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat } from "@/utils/date";

export const ProdcutInformation = ({ productDetail }) => {
  const { isLogin } = useClientAuthContext();

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
            <div className="text-[65px] font-extrabold -mb-5">{productDetail.name}</div>
            <div className="text-[20px]">Người bán: <span className="font-extrabold">{productDetail.seller}</span></div>
            <div className="text-[20px]">Liên hệ: <span className="font-extrabold">{productDetail.seller_email}</span></div>
            <div className="flex items-center gap-5 mt-5">
              <div className="text-[15px] font-bold"><span className="">Giá khởi điểm:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.starting_price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Giá hiện tại:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Giá mua ngay:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.immediate_purchase_price).toLocaleString("vi-VN")}</span></div>
              <div className="text-[15px] font-bold"><span className="">Bước giá:</span> <span className="text-[var(--main-client-color)] text-[18px]">${parseInt(productDetail.pricing_step).toLocaleString("vi-VN")}</span></div>
            </div>
            <div className="mt-[30px]">
              <div className="text-[15px] font-bold mb-2.5">Thời gian còn lại:</div>
              {/* <div className="grid grid-cols-4 gap-7">
                <div className="flex flex-col">
                  <div className="bg-[var(--main-client-color)] px-6 py-1 text-white font-extrabold text-[30px] text-center">07</div>
                  <div className="text-center text-[18px] text-[var(--main-client-color)]">Ngày</div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-[var(--main-client-color)] px-6 py-1 text-white font-extrabold text-[30px] text-center">18</div>
                  <div className="text-center text-[18px] text-[var(--main-client-color)]">Giờ</div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-[var(--main-client-color)] px-6 py-1 text-white font-extrabold text-[30px] text-center">35</div>
                  <div className="text-center text-[18px] text-[var(--main-client-color)]">Phút</div>
                </div>
                <div className="flex flex-col">
                  <div className="bg-[var(--main-client-color)] px-6 py-1 text-white font-extrabold text-[30px] text-center">47</div>
                  <div className="text-center text-[18px] text-[var(--main-client-color)]">Giây</div>
                </div>
              </div> */}
            </div>
            <div className="text-[15px] mt-[30px] font-bold">Thời điểm đăng: <span className="font-light">{dateTimeFormat(productDetail.posted_date_time)}</span></div>
            <div className="text-[15px] mt-[30px] font-bold">Phiên đấu giá kết thúc tại: <span className="font-light">{productDetail.end_date_time ? dateTimeFormat(productDetail.end_date_time) : "-"}</span></div>
            <div className="mt-5">
              <div className="text-[15px] font-bold">Mô tả sản phẩm:</div>
              <div className="bg-gray-100 p-5 rounded-xl mt-3" dangerouslySetInnerHTML={{__html: productDetail.description}}></div>
            </div>
            {isLogin && (
              <div className="mt-[30px] flex justify-center">
                <Button className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"}>
                  <Heart />
                  <span>Thêm vào yêu thích</span>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-[30px]">
            <div className="text-[20px] font-bold mb-[10px]">Đấu giá</div>
            <div className="flex items-center gap-5">
              <div><DollarSign /></div>
              <Input
                type="number"
              />
              <Button>Gửi</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}