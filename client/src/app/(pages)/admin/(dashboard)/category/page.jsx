"use client"

import { Button } from "@/components/ui/button";
import { DashboardFilter } from "../components/DashboardFilter/DashboardFilter";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";
import CategoryTable from "./components/CategoryTable";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

export default function AdminCategory() {
  const router = useRouter();
  
  return (
    <>
      <div className="mt-6">
        <DashboardFilter
          showCategory={false}
        />
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch />
          <Button onClick={() => router.push("/admin/category/create")} variant="outline" className="aspect-square max-sm:p-0 bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white">
            <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
            <span className="max-sm:sr-only">Tạo mới</span>
          </Button>
        </div>

        <CategoryTable />
      </div>
    </>
  )
}