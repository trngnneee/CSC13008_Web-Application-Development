"use client"

import { usePathname } from "next/navigation";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSider } from "./components/DashboardSider";
import { AdminDashboardVariable } from "@/config/variable";
import { DashboardTitle } from "./components/DashboardTitle";

export default function AdminDashboardLayout({ children }){
  const pathName = usePathname();
  const lastParam = pathName.split('/').filter(Boolean).pop();

  return (
    <>
      <div className="bg-[#F5F6FA]">
        <DashboardHeader />
        <div className="flex relative">
          <DashboardSider />
          <div className="m-6">
            <DashboardTitle
              title={AdminDashboardVariable.find((item) => item.value === lastParam)?.label}
            />
            <div className="mt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}