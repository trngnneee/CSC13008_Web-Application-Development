import Link from "next/link";
import { BackgroundSider } from "./components/backgroundSider";
import { ChevronLeft } from "lucide-react";

export default function AdminAccountLayout({ children }){
  return (
    <>
      <div className="flex h-[calc(100vh-3rem)] m-6 border border-gray-300 rounded-[20px] overflow-hidden shadow-xl">
        <BackgroundSider/>
        <div className="w-2/5 flex flex-col justify-center items-center relative">
          <Link href="/" className="flex items-center justify-center gap-[5px] text-[#A3AED0] absolute top-5 left-3">
            <ChevronLeft/>
            <div>Quay lại trang chủ</div>
          </Link>
          <div className="w-[410px]">
            {children}
          </div>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-sm text-[#A3AED0]">© 2025 SnapBid. All rights reserved.</div>
        </div>
      </div>
    </>
  )
}