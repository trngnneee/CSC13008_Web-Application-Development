"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Section1 = () => {
  const router = useRouter();
  
  return (
    <div className="relative w-full h-[calc(100vh-90px)] flex justify-center items-center bg-[#f8f8f8]">
      <img
        src="/bg.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div className="relative z-10 flex items-center gap-20 px-10 -mt-10">
        <div className="relative flex items-center justify-center">
          <div
            className="w-[600px] h-[600px] rounded-full bg-[url('/shape1.png')] bg-cover bg-center flex justify-center items-center"
          >
            <div className="absolute text-[60px] font-extrabold text-black text-center leading-tight">
              Khám phá, đấu giá, sở hữu – Mọi thứ trong tầm tay
            </div>
          </div>
        </div>

        <div className="border-2 border-black h-[150px]"></div>

        <div className="flex flex-col justify-center text-black w-[500px]">
          <div className="text-lg font-medium leading-relaxed">
            Ưu đãi 10% cho người dùng đăng ký sớm! <br/>
            Đừng bỏ lỡ cơ hội trải nghiệm sản phẩm chất lượng với giá ưu đãi đặc biệt này.
          </div>
          <Button onClick={() => router.push("/account/register")} className="mt-6 w-[150px] h-[50px] hover:scale-[1.05] transition-all duration-300 bg-[var(--main-client-color)] text-white hover:bg-[var(--main-client-hover)] text-[16px]">
            Đăng ký 
          </Button>
        </div>
      </div>
    </div>
  );
};