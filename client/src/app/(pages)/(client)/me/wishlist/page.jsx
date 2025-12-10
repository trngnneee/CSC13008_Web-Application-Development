"use client";

import { useEffect, useState } from "react";
import { ProductItem } from "../../components/ProductItem/ProductItem";
import { HeaderTitle } from "../components/HeaderTitle";
import { clientWishlistGet } from "@/lib/clientAPI/user";
import { buildParams } from "@/helper/params";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductItemSkeleton } from "../../components/ProductItem/ProductItemSkeleton";

export default function WishlistPage() {
  const [productList, setProductList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const params = buildParams({ page: currentPage });
      const promise = await clientWishlistGet(params);
      if (promise.code == "success") {
        setProductList(promise.productList);
        setTotalPages(promise.totalPages);
      }
    };
    fetchData();
  }, [currentPage])

  return (
    <>
      <HeaderTitle title="Danh sách yêu thích" />
      <div
        className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
      >
        {productList.length > 0 ? productList.map((item, index) => (
          <ProductItem
            key={index}
            item={item}
          />
        )) : (
          [...Array(4)].map((_, index) => (
            <ProductItemSkeleton key={index} />
          ))
        )}
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
          </PaginationItem  >
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
    </>
  )
}