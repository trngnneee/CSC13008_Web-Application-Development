"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductItem } from "../../components/ProductItem/ProductItem";
import { HeaderTitle } from "../components/HeaderTitle";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { useState } from "react";

const CategoryPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
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
            onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
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
            onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages))}
            aria-label="Trang sau"
            aria-disabled={currentPage === totalPages ? true : undefined}
            role={currentPage === totalPages ? "link" : undefined}
          >
            <ChevronRightIcon size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default function AuctionPage() {
  const data1 = [
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product2.png",
      name: "Plant and Pots",
      seller: "Jose Guillermo",
      currentBid: "1200",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    }
  ]
  const data2 = [
    {
      image: "/product2.png",
      name: "Plant and Pots",
      seller: "Jose Guillermo",
      currentBid: "1200",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    }
  ]

  return (
    <>
      <HeaderTitle title="Danh sách sản phẩm đấu giá" />
      <Tabs className="items-center mt-5" defaultValue="auction">
        <TabsList
          className="h-auto rounded-none border-b bg-transparent p-0 justify-center"
        >
          <TabsTrigger className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary" value="auction">
            Sản phẩm đã đấu giá
          </TabsTrigger>
          <TabsTrigger className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary" value="win">
            Sản phẩm thắng đấu giá
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className={"w-full"}>
          <div
            className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
          >
            {data1.map((item, index) => (
              <ProductItem
                key={index}
                item={item}
              />
            ))}
          </div>
          <CategoryPagination
            currentPage={1}
            totalPages={10}
          />
        </TabsContent>
        <TabsContent value="win" className={"w-full"}>
          <div
            className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
          >
            {data2.map((item, index) => (
              <ProductItem
                key={index}
                item={item}
              />
            ))}
          </div>
          <CategoryPagination
            currentPage={1}
            totalPages={10}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}