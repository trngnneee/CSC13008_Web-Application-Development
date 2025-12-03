"use client"

import { useRouter } from "next/navigation";
import { DashboardMultipleApply } from "../../../components/DashboardMultipleApply";
import { DashboardSearch } from "../../../components/DashboardSearch";
import UserTable from "./UserTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserContent() {
  const router = useRouter();
  const [filter, setFilter] = useState({
    keyword: "",
    page: 1
  })

  const [totalPage, setTotalPage] = useState();
  useEffect(() => {
    // const fetchData = async () => {
    //   const promise = await productTotalPage();
    //   if (promise.code == "success") {
    //     setTotalPage(promise.data)
    //   }
    // }
    // fetchData();
  }, [])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  }

  const [selectedItem, setSelectedItem] = useState([]);

  return (
    <>
      <div className="text-[24px] font-semibold text-[var(--main-color)] mt-6">Danh sách người dùng</div>
      <div className="mt-3">
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch onFilterChange={handleFilterChange} />
          <Button onClick={() => router.push("/admin/user/create")} variant="outline" className="aspect-square max-sm:p-0 bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white">
            <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
            <span className="max-sm:sr-only">Tạo mới</span>
          </Button>
        </div>

        <UserTable />
      </div>
    </>
  )
}