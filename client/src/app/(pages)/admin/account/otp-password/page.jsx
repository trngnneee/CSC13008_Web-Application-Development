"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { OTPInputComponent } from "./components/OTPInput";

export default function AdminRegisterPage() {
  const [otp, setOtp] = useState("")
  
  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-color)]">Xác thực OTP</div>
      <div className="text-gray-400 mb-10">Nhập OTP được gửi đến email để tiếp tục</div>
      <form>
        <div className="flex justify-center mb-[33px]">
          <OTPInputComponent
            otp={otp}
            setOtp={setOtp}
          />
        </div>
        <Button className="w-full bg-[var(--main-color)] hover:bg-[var(--main-hover)]">Xác thực OTP</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-color)] text-center">Đã có tài khoản? <Link className="font-bold hover:underline" href="/admin/account/login">Đăng nhập</Link></div>
    </>
  );
}