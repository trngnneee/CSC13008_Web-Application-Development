"use client"

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateTimeFormat } from "@/utils/date";

export const ProductDescription = ({ descriptionHistory }) => {
  const [showAllDesc, setShowAllDesc] = useState(false);
  
  return (
    <>
      <div className="mt-5 relative">
        <div className="text-[30px] font-extrabold mb-2.5">Mô tả sản phẩm:</div>
        <div className={cn(
          "bg-white shadow-xl border border-gray-100 p-10 rounded-xl my-5 max-h-[500px] overflow-hidden",
          showAllDesc ? "max-h-full" : ""
        )}>
          {descriptionHistory.map((desc, index) => (
            <div key={index} className={cn(
              "mb-3",
              index !== descriptionHistory.length - 1 && "border-b border-gray-200 pb-3"
            )}>
              <div className="text-xs text-gray-400 mb-1">{dateTimeFormat(desc.time)}</div>
              <div dangerouslySetInnerHTML={{ __html: desc.description }} className="wrap-break-words whitespace-normal overflow-hidden"></div>
            </div>
          ))}
        </div>
        {!showAllDesc && (
          <Button onClick={() => setShowAllDesc(true)} className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-[var(--main-client-color)] font-bold bg-white shadow-2xl px-5 py-2 border border-gray-200 hover:bg-gray-100 hover:shadow-lg">
            <ChevronDown />
            <span>Xem thêm</span>
          </Button>
        )}
      </div>
    </>
  )
}