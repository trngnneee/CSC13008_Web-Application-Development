"use client"

import { cn } from "@/lib/utils"
import { Gavel, Heart, Star, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const Sider = () => {
  const pathName = usePathname();
  const siderData = [
    {
      title: "Thông tin cá nhân",
      href: "/me/profile",
      icon: User
    },
    {
      title: "Nhận xét và đánh giá",
      href: "/me/feedback",
      icon: Star
    },
    {
      title: "Danh sách yêu thích",
      href: "/me/wishlist",
      icon: Heart
    },
    {
      title: "Danh sách đấu giá của tôi",
      href: "/me/auction",
      icon: Gavel
    },
  ]
  
  return (
    <div className="rounded-[20px] shadow-2xl gap-5 border border-gray-200 p-5 sticky top-20 self-start">
      <div className="flex flex-col gap-3 top-20">
        {siderData.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-lg hover:bg-[var(--main-client-hover)] hover:text-white transition-colors",
              pathName === item.href ? "bg-[var(--main-client-color)] font-medium text-white" : "font-normal"
            )}
          >
            <item.icon />
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  )
}