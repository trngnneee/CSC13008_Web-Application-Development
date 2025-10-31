"use client"

import { AdminDashboardVariable } from "@/config/variable";
import { cn } from "@/lib/utils";
import { CircleGauge, Grid2X2, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardSider = () => {
  const navList = [
    {
      Icon: CircleGauge,
      link: "/admin/dashboard"
    },
    {
      Icon: Grid2X2,
      link: "/admin/category"
    },
    {
      Icon: ShoppingBag,
      link: "/admin/product"
    },
    {
      Icon: User,
      link: "/admin/user"
    },
  ]

  const pathName = usePathname();

  return (
    <>
      <div className="w-1/6 bg-white h-[calc(100vh-80px)] fix top-0 left-0 border-r border-[#E0E0E0]">
        <div className="text-white mt-[11px] flex flex-col gap-2.5">
          {navList.map((item, index) => {
            const lastParam = item.link.split('/').filter(Boolean).pop();
            const title = AdminDashboardVariable.find((item) => item.value === lastParam)?.label;

            return (
              <Link href={item.link} className="relative" key={index}>
                <div className={cn(
                  "bg-[#4880FF] w-[5px] absolute left-0 top-0 bottom-0 rounded-r",
                  pathName === item.link ? "block" : "hidden"
                )}></div>
                <div className={cn(
                  "flex items-center bg-[#4880FF] hover:bg-[#487fffe3] py-4 pl-3 rounded-[6px] gap-4 ml-5 mr-3",
                  pathName === item.link ? "bg-[#4880FF]" : "bg-white text-[#404040] hover:bg-[#F5F6FA]"
                )}>
                  <item.Icon />
                  <div className="text-sm font-medium -translate-y-0.5">{title}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  );
}