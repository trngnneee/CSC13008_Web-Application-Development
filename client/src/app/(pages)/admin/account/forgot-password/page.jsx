import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminRegisterPage() {
  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-color)]">Quên mật khẩu</div>
      <div className="text-gray-400 mb-10">Nhập email để tiếp tục</div>
      <form>
        <div className="mb-6 *:not-first:mt-2">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--main-color)] ">Email*</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="example@gmail.com"
          />
        </div>
        <Button className="w-full bg-[var(--main-color)] hover:bg-[var(--main-hover)]">Gửi OTP</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-color)] text-center">Đã có tài khoản? <Link className="font-bold hover:underline" href="/admin/account/login">Đăng nhập</Link></div>
    </>
  );
}