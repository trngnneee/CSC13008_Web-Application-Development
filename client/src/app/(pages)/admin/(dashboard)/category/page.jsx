"use client"

import { Button } from "@/components/ui/button";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";
import CategoryTable from "./components/CategoryTable";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardPagination from "../components/DashboardPagination";
import { getTotalPage } from "@/lib/adminAPI/category";
import { set } from "date-fns";

export default function AdminCategory() {
  const router = useRouter();
  
  const [filter, setFilter] = useState({
    keyword: "",
    page: 1
  })

  const [totalPage, setTotalPage] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const promise = await getTotalPage();
      if (promise.code == "success")
      {
        setTotalPage(promise.data);
      }
    }
    fetchData();
  }, [])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  }

  return (
    <>
      <div className="mt-6">
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch
            onFilterChange={handleFilterChange}
          />
          <Button onClick={() => router.push("/admin/category/create")} variant="outline" className="aspect-square max-sm:p-0 bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white">
            <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
            <span className="max-sm:sr-only">Tạo mới</span>
          </Button>
        </div>

        <CategoryTable
          filter={filter}
        />

        <div className="mt-5">
          <DashboardPagination
            currentPage={filter.page}
            totalPages={totalPage}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </>
  )
}