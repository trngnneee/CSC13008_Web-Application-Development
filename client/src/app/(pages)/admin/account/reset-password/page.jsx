import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <>
      <div className="font-bold text-[36px] text-[var(--main-color)]">Đổi mật khẩu</div>
      <div className="text-gray-400 mb-10">Nhập mật khẩu và xác nhận mật khẩu để tiếp tục</div>
      <form>
        <div className="mb-[31px] *:not-first:mt-2">
          <Label htmlFor="password" className="text-sm font-medium text-[var(--main-color)]">Mật khẩu*</Label>
          <Input
            type="password"
            id="password"
            name="password"
          />
        </div>
        <div className="mb-[31px] *:not-first:mt-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium text-[var(--main-color)]">Xác nhận mật khẩu*</Label>
          <Input
            type="password"
            id="confirm-password"
            name="confirm-password"
          />
        </div>
        <Button className="w-full bg-[var(--main-color)] hover:bg-[var(--main-hover)]">Đổi mật khẩu</Button>
      </form>
      <div className="mt-[26px] text-[var(--main-color)] text-center">Chưa có tài khoản? <Link className="font-bold hover:underline" href="/admin/account/register">Đăng ký</Link></div>
    </>
  );
}