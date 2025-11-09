import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { AiFillGithub } from "react-icons/ai";

export const ClientFooter = () => {
  return (
    <>
      <div className="bg-[#323232] pt-[126px] pb-8">
        <div className="container mx-auto text-white flex items-center gap-[110px]">
          <div>
            <div className="font-bold text-[60px]">SnapBid</div>
            <div>
              <div>Địa chỉ: 127 Nguyễn Văn Cừ, phường Chợ Quán, Thành phố Hồ Chí Minh</div>
              <div>Số điện thoại: 0911398029</div>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="font-bold text-[20px] mb-[13px]">Liên hệ với chúng tôi</div>
            <div className="flex flex-row gap-2.5 mb-5">
              <Input
                type="email"
              />
              <Button className="bg-transparent hover:bg-[#00000018] border border-white">Gửi</Button>
            </div>
            <div className="flex items-center gap-10 mt-[30px]">
              <div className="cursor-pointer">Điều khoản dịch vụ</div>
              <div className="cursor-pointer">Chính sách bảo mật</div>
            </div>
          </div>

        </div>

        <div className="flex justify-between items-center container mx-auto mt-[123px] text-white">
          <div>© 2025 SnapBid. All rights reserved</div>
          <div className="flex items-center gap-3">
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
              <Link href="#" target="_blank">
                <FaFacebookF className="text-[#323232]" />
              </Link>
            </div>
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
              <Link href="#" target="_blank">
                <FaInstagram className="text-[#323232]" />
              </Link>
            </div>
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
              <Link href="#" target="_blank">
                <AiFillGithub className="text-[#323232]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}