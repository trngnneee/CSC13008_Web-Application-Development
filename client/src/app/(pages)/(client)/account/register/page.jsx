import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ClientRegisterPage() {
  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-client-color)]">Đăng ký</div>
      <div className="text-gray-400 mb-5">Nhập họ tên, email và mật khẩu để đăng ký</div>
      <form id="adminRegisterFrom">
        <div className="mb-6 *:not-first:mt-2">
          <Label htmlFor="fullname" className="text-sm font-medium text-[var(--main-client-color)] ">Họ tên*</Label>
          <Input
            type="text"
            id="fullname"
            name="fullname"
            placeholder="Le Van A"
          />
        </div>
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
        <div className="flex items-center gap-[11px] mb-2">
          <Checkbox id="agree" name="agree" className="data-[state=checked]:bg-[var(--main-client-color)]" />
          <Label htmlFor="agree" className="text-sm text-[var(--main-client-color)]">
            Đồng ý với chính sách điều khoản
          </Label>
        </div>
        <div id="agreeContainer" className="mb-[33px]"></div>
        <Button className="w-full bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">Đăng ký</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-client-color)] text-center">Đã có tài khoản? <Link className="font-bold hover:underline" href="/account/login">Đăng nhập</Link></div>
    </>
  )
}