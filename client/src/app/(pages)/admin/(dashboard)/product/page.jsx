"use client"

import { useEffect, useState } from "react";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";
import ProductTable from "./components/ProductTable";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { productTotalPage } from "@/lib/adminAPI/product";
import DashboardPagination from "../components/DashboardPagination";

export default function AdminProduct() {
  const router = useRouter();
  const [filter, setFilter] = useState({
    keyword: "",
    page: 1
  })

  const [totalPage, setTotalPage] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const promise = await productTotalPage();
      if (promise.code == "success") {
        setTotalPage(promise.data)
      }
    }
    fetchData();
  }, [])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  }

  const [selectedItem, setSelectedItem] = useState([]);

  return (
    <>
      <div className="mt-6">
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply
            selectedItem={selectedItem}
            api={`${process.env.NEXT_PUBLIC_API_URL}/admin/product/delete-list`}
          />
          <DashboardSearch
            onFilterChange={handleFilterChange}
          />
          <Button onClick={() => router.push("/admin/product/create")} variant="outline" className="aspect-auto bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white gap-2">
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Button>
          <Button onClick={() => router.push("/admin/product/import")} variant="outline" className="aspect-auto bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white gap-2">
            <Download className="w-4 h-4" />
            <span>Import dữ liệu</span>
          </Button>
          <Button onClick={() => router.push("/admin/product/add-time")} variant="outline" className="aspect-auto bg-[var(--main-color)] hover:bg-[var(--main-hover)] text-white hover:text-white gap-2">
            <Download className="w-4 h-4" />
            <span>Thời gian tự động gia hạn</span>
          </Button>
        </div>

        <ProductTable
          filter={filter}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
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