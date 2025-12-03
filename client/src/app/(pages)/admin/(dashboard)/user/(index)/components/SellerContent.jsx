"use client"

import { useRouter } from "next/navigation";
import { DashboardSearch } from "../../../components/DashboardSearch";
import { useEffect, useState } from "react";
import SellerTable from "./SellerTable";

export default function SellerContent() {
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
      <div className="text-[24px] font-semibold text-[var(--main-color)] mt-6">Danh sách Seller chờ duyệt</div>
      <div className="mt-3">
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardSearch onFilterChange={handleFilterChange} />
        </div>

        <SellerTable />
      </div>
    </>
  )
}