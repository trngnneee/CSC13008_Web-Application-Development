"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export default function ClientLoginPage() {
  const [rememberLogin, setRememberLogin] = useState(false);

  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-client-color)]">Đăng nhập</div>
      <div className="text-gray-400 mb-5">Nhập email và mật khẩu để đăng nhập</div>
      <form id="">
        <div className="mb-6 *:not-first:mt-2">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--main-client-color)] ">Email*</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="example@gmail.com"
          />
        </div>
        <div className="mb-[31px] *:not-first:mt-2">
          <Label htmlFor="password" className="text-sm font-medium text-[var(--main-client-color)]">Mật khẩu*</Label>
          <Input
            type="password"
            id="password"
            name="password"
          />
        </div>
        <div className="flex justify-between items-center mb-[33px]">
          <div className="flex items-center gap-[11px]">
            <Checkbox id="rememberLogin" className="data-[state=checked]:bg-[var(--main-client-color)]" checked={rememberLogin} onCheckedChange={setRememberLogin} />
            <Label htmlFor="rememberLogin" name="rememberLogin" className="text-sm text-[var(--main-client-color)]">Ghi nhớ đăng nhập</Label>
          </div>
          <Link href="/account/forgot-password" className="text-sm text-[var(--main-client-color)] font-medium hover:underline">Quên mật khẩu?</Link>
        </div>
        <Button className="w-full bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">Đăng nhập</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-color)] text-center">Chưa có tài khoản? <Link className="font-bold hover:underline" href="/account/register">Đăng ký</Link></div>
    </>
  )
}