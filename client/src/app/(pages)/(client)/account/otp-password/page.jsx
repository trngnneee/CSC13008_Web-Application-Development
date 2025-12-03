"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { OTPInputComponent } from "./components/OTPInput";
import { useRouter, useSearchParams } from "next/navigation";
import { clientOTPPassword } from "@/lib/clientAPI/account";
import { toastHandler } from "@/lib/toastHandler";

export default function ClientOTPPasswordPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("OTP phải gồm 6 chữ số");
      return;
    }

    setError("");

    const promise = clientOTPPassword({ email, otp });

    toastHandler(promise, router, "/account/reset-password");
  }

  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-client-color)]">
        Xác thực OTP
      </div>
      <div className="text-gray-400 mb-10">
        Nhập OTP được gửi đến email để tiếp tục
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center mb-[20px]">
          <OTPInputComponent otp={otp} setOtp={setOtp} />
        </div>

        {error && (
          <div className="text-red-500 text-[12px] mb-4">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"
        >
          Xác thực OTP
        </Button>
      </form>

      <div className="mt-[26px] text-[var(--main-client-color)] text-center">
        Đã có tài khoản?{" "}
        <Link
          className="font-bold hover:underline"
          href="/account/login"
        >
          Đăng nhập
        </Link>
      </div>
    </>
  );
}