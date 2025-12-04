"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";

export const ProdcutInformation = () => {
  const { isLogin } = useClientAuthContext();

  return (
    <>
      <div className="relative">
        <div className="w-[200px] h-[200px] overflow-hidden absolute -top-[50px] -left-[100px] z-[5]">
          <img
            src="/shape1.png"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="z-10 border-b-2 border-black pb-[30px]">
          <div className="text-[65px] font-extrabold -mb-5">Mona Lisa</div>
          <div className="text-[20px]">By <span className="font-extrabold">Leonardo da Vinci</span></div>
          <div className="text-[30px] text-[var(--main-client-color)] font-extrabold mt-[20px]">Giá hiện tại: $700</div>
          <div className="mt-[30px]">
            <div className="text-[20px] mb-2.5">Thời gian còn lại:</div>
            <div className="grid grid-cols-4 gap-7">
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
            </div>
          </div>
          <div className="text-[15px] mt-[30px] font-bold">Phiên đấu giá kết thúc tại: <span className="font-light">16.4.2023 08:05:33 GMT+8</span></div>
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
    </>
  )
}