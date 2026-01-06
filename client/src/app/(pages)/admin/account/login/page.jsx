"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/adminAPI/account";
import { toastHandler } from "@/lib/toastHandler";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [rememberLogin, setRememberLogin] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    const validation = new JustValidate("#adminLoginForm");
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
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập mật khẩu!',
        },
        {
          validator: (value) => value.length >= 8,
          errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        },
        {
          validator: (value) => /[A-Z]/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        },
        {
          validator: (value) => /[a-z]/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        },
        {
          validator: (value) => /\d/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
        },
        {
          validator: (value) => /[@$!%*?&]/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
        },
      ])
      .onSuccess(() => {
        setSubmit(true);
      })
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!submit) return;

    if (captcha === "" || captcha === null) {
      toast.error("Vui lòng xác minh reCAPTCHA!");
      setSubmit(false);
      return;
    }

    const finalData = {
      email: event.target.email.value,
      password: event.target.password.value,
      rememberPassword: rememberLogin
    }

    const promise = adminLogin(finalData);
    toastHandler(promise, router, "/admin/category");
    setSubmit(false);
  }

  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-color)]">Đăng nhập</div>
      <div className="text-gray-400 mb-10">Nhập email và mật khẩu để đăng nhập</div>
      <form id="adminLoginForm" onSubmit={handleSubmit}>
        <div className="mb-6 *:not-first:mt-2">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--main-color)] ">Email*</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="example@gmail.com"
          />
        </div>
        <div className="mb-[31px] *:not-first:mt-2">
          <Label htmlFor="password" className="text-sm font-medium text-[var(--main-color)]">Mật khẩu*</Label>
          <Input
            type="password"
            id="password"
            name="password"
          />
        </div>
        <div className="flex justify-between items-center mb-[33px]">
          <div className="flex items-center gap-[11px]">
            <Checkbox id="rememberLogin" className="data-[state=checked]:bg-[var(--main-color)]" checked={rememberLogin} onCheckedChange={setRememberLogin} />
            <Label htmlFor="rememberLogin" name="rememberLogin" className="text-sm text-[var(--main-color)]">Ghi nhớ đăng nhập</Label>
          </div>
          <Link href="/admin/account/forgot-password" className="text-sm text-[var(--main-color)] font-medium hover:underline">Quên mật khẩu?</Link>
        </div>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(value) => {
            setCaptcha(value);
          }}
          className="mb-5"
        />
        <Button className="w-full bg-[var(--main-color)] hover:bg-[var(--main-hover)]">Đăng nhập</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-color)] text-center">Chưa có tài khoản? <Link className="font-bold hover:underline" href="/admin/account/register">Đăng ký</Link></div>
    </>
  );
}