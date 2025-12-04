"use client"

import { Label } from "@/components/ui/label";
import { HeaderTitle } from "../components/HeaderTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import JustValidate from "just-validate";

export default function ResetPasswordPage() {
  const [submit, setSubmit] = useState(false);
  
  useEffect(() => {
    const validation = new JustValidate('#reset-password-form');
    validation
      .addField('#old-password', [
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
      .addField('#confirm-password', [
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
        {
          validator: (value, fields) => {
            const password = fields['#password'].elem.value;
            return value == password;
          },
          errorMessage: 'Mật khẩu xác nhận không khớp!',
        }
      ])
      .onSuccess(() => {
        setSubmit(true);
      });
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submit)
    {
      const oldPassword = e.target['old-password'].value;
      const password = e.target.password.value;

      console.log({ oldPassword, password });
    }
  }

  return (
    <>
      <HeaderTitle title="Đặt lại mật khẩu" />
      <form id="reset-password-form" className="mt-5" onSubmit={handleSubmit}>
        <div className="flex gap-5 items-center">
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="old_password" className={"text-[var(--main-client-color)]"}>Mật khẩu cũ</Label>
            <Input
              id="old-password"
              name="old-password"
              type="password"
              placeholder="Nhập mật khẩu cũ"
            />
          </div>
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="password" className={"text-[var(--main-client-color)]"}>Mật khẩu mới</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
        </div>
        <div className="flex gap-5 items-center mt-5">
          <div className="*:not-first:mt-2 w-full">
            <Label htmlFor="confirm-password" className={"text-[var(--main-client-color)]"}>Xác nhận mật khẩu</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div className="w-full">
          </div>
        </div>
        <Button disabled={submit} className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] w-full mt-5"}>Lưu</Button>
        <Link href="/me/profile" className="block mt-3 text-center text-[var(--main-client-color)] hover:underline">Quay lại</Link>
      </form>
    </>
  )
}