"use client"

import { HeaderTitle } from "../components/HeaderTitle";
import { dateFormat } from "@/utils/date";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Pen, Plus, ShoppingBag, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { clientProductListBySeller } from "@/lib/clientAPI/product";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { buildParams } from "@/helper/params";
import { Badge } from "@/components/ui/badge";

export default function SellerProductPage() {
  const router = useRouter();

  const { userInfo } = useClientAuthContext();
  const [productList, setProductList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'sold'

  useEffect(() => {
    if (!userInfo) return;
    const fetchData = async () => {
      const params = buildParams({ page: currentPage, status: activeTab });
      const promise = await clientProductListBySeller(userInfo.id_user, params);
      if (promise.code == "success") {
        setProductList(promise.productList);
        setTotalPages(promise.totalPages);
      }
    };
    fetchData();
  }, [userInfo, currentPage, activeTab]);

  // Reset page khi đổi tab
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div>
      <HeaderTitle title={activeTab === "active" ? "Sản phẩm đang bán" : "Sản phẩm đã có người mua"} />
      
      {/* Tabs */}
      <div className="flex gap-2 mt-5">
        <Button
          onClick={() => setActiveTab("active")}
          variant={activeTab === "active" ? "default" : "outline"}
          className={cn(
            activeTab === "active" 
              ? "bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]" 
              : ""
          )}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Đang bán & còn đấu giá
        </Button>
        <Button
          onClick={() => setActiveTab("sold")}
          variant={activeTab === "sold" ? "default" : "outline"}
          className={cn(
            activeTab === "sold" 
              ? "bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]" 
              : ""
          )}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Đã có người mua
        </Button>
      </div>

      {activeTab === "active" && (
        <div className="mt-4">
          <Button onClick={() => router.push("/me/product/create")} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] font-bold"><Plus /> Tạo sản phẩm mới</Button>
        </div>
      )}
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <table className="min-w-full text-[12px] text-gray-700">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="p-3 text-left">Tên sản phẩm</th>
              <th className="p-3 text-center">Ảnh</th>
              <th className="p-3 text-center">Danh mục</th>
              <th className="p-3 text-center">Giá khởi điểm</th>
              <th className="p-3 text-center">Giá hiện tại</th>
              <th className="p-3 text-center">Giá mua ngay</th>
              <th className="p-3 text-center">Bắt đầu</th>
              <th className="p-3 text-center">Kết thúc</th>
              <th className="p-3 text-center">Trạng thái</th>
              {activeTab === "active" && <th className="p-3 text-center">Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {productList.length > 0 ? productList.map((item) => (
              <tr
                key={item.id_product}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">
                  <div className="w-10 h-10 overflow-hidden">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </td>
                <td className="p-3 text-center">{item.name_category}</td>
                <td className="p-3 text-center">{parseInt(item.starting_price).toLocaleString("vi-VN")} VND</td>
                <td className="p-3 text-center font-bold text-[var(--main-client-color)]">{parseInt(item.price).toLocaleString("vi-VN")} VND</td>
                <td className="p-3 text-center">{parseInt(item.immediate_purchase_price).toLocaleString("vi-VN")} VND</td>
                <td className="p-3 text-center text-[12px] text-gray-500">{dateFormat(new Date(item.posted_date_time))}</td>
                <td className="p-3 text-center text-[12px] text-gray-500">{item.end_date_time ? dateFormat(new Date(item.end_date_time)) : "-"}</td>
                <td className="p-3 text-center">
                  {activeTab === "active" ? (
                    <Badge>Đang bán</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Đã kết thúc</Badge>
                  )}
                </td>
                {activeTab === "active" && (
                  <td className="p-3 gap-2">
                    <Button onClick={() => router.push(`/me/product/update/${item.id_product}`)} className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] p-0 w-8 h-8"}>
                      <Pen />
                    </Button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={activeTab === "active" ? 10 : 9} className="p-8 text-center text-gray-500">
                  {activeTab === "active" ? "Chưa có sản phẩm đang bán" : "Chưa có sản phẩm đã bán"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination className={"mt-5"}>
        <PaginationContent className="justify-between gap-[30px]">
          <PaginationItem>
            <PaginationLink
              className={cn(
                "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                buttonVariants({
                  variant: "outline",
                })
              )}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              aria-label="Go to previous page"
              aria-disabled={currentPage === 1 ? true : undefined}
              role={currentPage === 1 ? "link" : undefined}
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Trang <span className="text-foreground">{currentPage}</span> của{" "}
              <span className="text-foreground">{totalPages}</span>
            </p>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              className={cn(
                "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                buttonVariants({
                  variant: "outline",
                })
              )}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              aria-label="Go to next page"
              aria-disabled={currentPage === totalPages ? true : undefined}
              role={currentPage === totalPages ? "link" : undefined}
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}