"use client"

import { useEffect, useState } from "react";
import { CategoryItem } from "../components/CategoryItem";
import { clientParentList } from "@/lib/clientAPI/category";
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
import { Breadcrumb } from "../components/Breadcrumb";

export default function CategoryListPage() {
  const [parentCategories, setParentCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      const params = buildParams({ page: currentPage });
      const promise = await clientParentList(params);
      if (promise.code == "success") {
        setParentCategories(promise.parentCategories);
        setTotalPages(promise.totalPages);
      }
    };
    fetchData();
  }, [currentPage]);

  return (
    <>
      <Breadcrumb title={"Danh sách danh mục"} />
      <div className="mx-auto container my-5">
        <div className="grid grid-cols-4 gap-[30px] mb-[30px]">
          {parentCategories.length > 0 && parentCategories.map((item, index) => (
            <CategoryItem
              key={index}
              item={item}
            />
          ))}
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