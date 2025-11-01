"use client"

import { Label } from "@/components/ui/label";
import { DashboardTitle } from "../../components/DashboardTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function AdminUserCreate() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  return (
    <>
      <DashboardTitle title="Tạo người dùng" />
      <form action="/form" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
        <div className="flex gap-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="fullName"
              className="text-sm font-semibold text-[#606060]"
            >
              Họ và tên
            </Label>
            <Input
              placeholder="Le Van A"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
        <div className="w-[calc(50%-15px)]">
          <div className="w-full flex flex-col gap-3 mt-[30px]">
            <Label
              htmlFor="category"
              className="text-sm font-semibold text-[#606060]"
            >
              Vai trò
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="role">
                <Button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{role || "Chọn vai trò"}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRole("")}>Chọn vai trò</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("Người đấu giá")}>Người đấu giá</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("Người bán")}>Người bán</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("Admin")}>Admin</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Tạo người dùng</Button>
          <Link href="/admin/user" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}