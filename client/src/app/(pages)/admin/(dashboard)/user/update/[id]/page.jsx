"use client"

import { Label } from "@/components/ui/label";
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
import { useParams, useRouter } from "next/navigation";
import { adminUserDetail, adminUserUpdate } from "@/lib/adminAPI/user";
import { DashboardTitle } from "../../../components/DashboardTitle";

export default function AdminUpdateCreate() {
  const router = useRouter();
  const { id } = useParams();
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
    const fetchData = async () => {
      const promise = await adminUserDetail(id);
      if (promise.code == "success")
      {
        setFullname(promise.data.fullname);
        setEmail(promise.data.email);
        setDate(promise.data.date_of_birth ? new Date(promise.data.date_of_birth) : null);
        setRole(promise.data.role);
      }
    };
    fetchData();
  }, [])

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
        .onSuccess(() => {
          setSubmit(true);
        });
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submit) {
      const finalData = {
        fullname,
        role,
        date_of_birth: date,
      }
      const promise = adminUserUpdate(id, finalData);
      toastHandler(promise, router, "/admin/user");
      setSubmit(false);
    }
  }

  return (
    <>
      <DashboardTitle title="Chỉnh sửa thông tin người dùng" />
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
              readOnly
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
                  value={roleVariable.find(item => item.value === role)?.label || ""}
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
        <div className="flex flex-col items-center mt-[30px]">
          <Button disabled={submit} className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Lưu</Button>
          <Link href="/admin/user" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}