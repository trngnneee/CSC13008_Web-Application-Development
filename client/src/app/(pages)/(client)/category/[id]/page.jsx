"use client"

import { useEffect, useState } from "react";
import { ProductItem } from "../../components/ProductItem/ProductItem";
import { clientProductListByCategory, clientProductSearch } from "@/lib/clientAPI/product";
import { useParams } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { ProductItemSkeleton } from "../../components/ProductItem/ProductItemSkeleton";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { buildParams } from "@/helper/params";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategoryPage() {
  const [productList, setProductList] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("normal");
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      const params = buildParams({ page: currentPage });
      const promise = await clientProductListByCategory(id, params, status);
      if (promise.code == "success") {
        setProductList(promise.productList);
        setCategoryName(promise.categoryName || "");
        setTotalPages(promise.totalPages || 0);
      }
    };
    fetchData();
  }, [id, currentPage, status])

  return (
    <>
      <Breadcrumb title={`Danh mục - ${categoryName}`} />
      <div className="container mx-auto my-5">
        <div className="my-5 w-[300px] flex justify-end">
          <Select onValueChange={(value) => setStatus(value)} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">-- Sắp xếp theo --</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="end-desc">Thời gian kết thúc giảm dần</SelectItem>
              <SelectItem value="end-asc">Thời gian kết thúc tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div
          className="grid grid-cols-4 gap-[30px] mb-[30px]"
        >
          {productList.length > 0 ? productList.map((item, index) => (
            <ProductItem
              key={index}
              item={item}
            />
          )) : (
            [...Array(8)].map((_, index) => (
              <ProductItemSkeleton key={index} />
            ))
          )}
        </div>
        <Pagination>
          <PaginationContent className="justify-between gap-[30px]">
            <PaginationItem>
              <PaginationLink
                className={cn(
                  "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                  buttonVariants({
                    variant: "outline",
                  })
                )}
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                aria-label="Trang trước"
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
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                aria-label="Trang sau"
                aria-disabled={currentPage === totalPages ? true : undefined}
                role={currentPage === totalPages ? "link" : undefined}
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )
}