"use client"

import { Label } from "@/components/ui/label";
import { DashboardTitle } from "../../components/DashboardTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { roleVariable } from "@/config/variable";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateFormat } from "@/utils/date";
import JustValidate from "just-validate";
import { toastHandler } from "@/lib/toastHandler";
import { useRouter } from "next/navigation";
import { adminUserAdd } from "@/lib/adminAPI/user";

export default function AdminUserCreate() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [date, setDate] = useState(new Date());
  const [submit, setSubmit] = useState(false);

  const handleCalendarChange = ( _value, _e) => {
    const _event = {
      target: {
        value: _value,
      },
    } 
    _e(_event);
  };

  useEffect(() => {
    const validation = new JustValidate('#userCreateForm');

    validation
      .addField('#fullname', [
        {
          rule: 'required',
          errorMessage: 'Họ và tên không được để trống',
        },
        {
          rule: 'minLength',
          value: 3,
          errorMessage: 'Họ và tên phải có ít nhất 3 ký tự',
        },
      ])
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Email không được để trống',
        },
        { 
          rule: 'email',
          errorMessage: 'Email không hợp lệ',
        },
      ])
      .addField('#role', [
        {
          rule: 'required',
          errorMessage: 'Vai trò không được để trống',
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
    if (submit) {
      const finalData = {
        fullname,
        email,
        role,
        date_of_birth: date,
        password,
      }
      const promise = adminUserAdd(finalData);
      toastHandler(promise, router, "/admin/user");
      setSubmit(false);
    }
  }

  return (
    <>
      <DashboardTitle title="Tạo người dùng" />
      <form onSubmit={handleSubmit} id="userCreateForm" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
        <div className="flex gap-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="fullname"
              className="text-sm font-semibold text-[#606060]"
            >
              Họ và tên
            </Label>
            <Input
              placeholder="Le Van A"
              id="fullname"
              name="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-[#606060]"
            >
              Email
            </Label>
            <Input
              type="email"
              placeholder="example@gmail.com"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-[30px] mt-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="category"
              className="text-sm font-semibold text-[#606060]"
            >
              Vai trò
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="role">
                <Input
                  type="text"
                  id="role"
                  name="role"
                  readOnly
                  value={role}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {roleVariable.map((roleItem) => (
                  <DropdownMenuItem key={roleItem.value} onClick={() => setRole(roleItem.value)}>{roleItem.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="fullName"
              className="text-sm font-semibold text-[#606060]"
            >
              Ngày sinh
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Input
                  type="text"
                  id="date_of_birth"
                  name="date_of_birth"
                  readOnly
                  value={date ? dateFormat(date) : ""}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Calendar
                  captionLayout="dropdown"
                  className="rounded-md border p-2"
                  classNames={{
                    month_caption: "mx-0",
                  }}
                  components={{
                    Dropdown: (props) => {
                      return (
                        <Select
                          onValueChange={(value) => {
                            if (props.onChange) {
                              handleCalendarChange(value, props.onChange);
                            }
                          }}
                          value={String(props.value)}
                        >
                          <SelectTrigger className="h-8 w-fit font-medium first:grow">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                            {props.options?.map((option) => (
                              <SelectItem
                                disabled={option.disabled}
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    },
                    DropdownNav: (props) => {
                      return (
                        <div className="flex w-full items-center gap-2">
                          {props.children}
                        </div>
                      );
                    },
                  }}
                  defaultMonth={new Date()}
                  hideNavigation
                  mode="single"
                  onSelect={setDate}
                  selected={date}
                  startMonth={new Date(1980, 6)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex gap-[30px] mt-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-[#606060]"
            >
              Mật khẩu
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-[#606060]"
            >
              Xác nhận mật khẩu
            </Label>
            <Input
              type="password"
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button disabled={submit} className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Tạo người dùng</Button>
          <Link href="/admin/user" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}