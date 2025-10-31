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
      <div>
        <DashboardHeader />
        <div className="flex relative">
          <DashboardSider />
          <div className="m-6 flex-1">
            <DashboardTitle
              title={AdminDashboardVariable.find((item) => item.value === lastParam)?.label}
            />
            <div className="mt-6 w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}