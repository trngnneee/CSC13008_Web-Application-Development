"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientForgotPassword } from "@/lib/clientAPI/account";
import { toastHandler } from "@/lib/toastHandler";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    const validation = new JustValidate("#clientForgotPasswordForm");
    validation
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Email bắt buộc!'
        },
        {
          rule: 'email',
          errorMessage: 'Email sai định dạng!',
        },
      ])
      .onSuccess((event) => {
        event.preventDefault();

        const finalData = {
          email: event.target.email.value
        }

        const promise = clientForgotPassword(finalData);
        toastHandler(promise, router, `/account/otp-password?email=${event.target.email.value}`)
      })
  }, [])

  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-client-color)]">Quên mật khẩu</div>
      <div className="text-gray-400 mb-10">Nhập email để tiếp tục</div>
      <form id="clientForgotPasswordForm">
        <div className="mb-6 *:not-first:mt-2">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--main-client-color)] ">Email*</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="example@gmail.com"
          />
        </div>
        <Button className="w-full bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">Gửi OTP</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-client-color)] text-center">Đã có tài khoản? <Link className="font-bold hover:underline" href="/account/login">Đăng nhập</Link></div>
    </>
  )
}