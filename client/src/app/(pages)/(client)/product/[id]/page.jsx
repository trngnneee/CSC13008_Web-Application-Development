"use client"

import { useEffect, useState } from "react";
import { BidHistory } from "./components/BidHistory";
import { ImageSlider } from "./components/ImageSlider";
import { OtherProduct } from "./components/OtherProduct";
import { ProdcutInformation } from "./components/ProductInformation";
import { useParams } from "next/navigation";
import { clientProductDetail } from "@/lib/clientAPI/product";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateTimeFormat } from "@/utils/date";

export default function ProductPage() {
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const [showAllDesc, setShowAllDesc] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientProductDetail(id);
      if (promise.code == "success") {
        setProductDetail(promise.productDetail);
      }
    }
    fetchData();
  }, [])

  return (
    <>
      <div className="container mx-auto py-[50px]">
        <div className="flex gap-[100px] mb-20">
          <ImageSlider imageList={productDetail && productDetail.url_img} />
          <ProdcutInformation productDetail={productDetail} />
        </div>
        {productDetail && (
          <div className="mt-5 relative">
            <div className="text-[15px] font-bold">Mô tả sản phẩm:</div>
            <div className={cn(
              "bg-white shadow-xl border border-gray-100 p-10 rounded-xl my-5 max-h-[500px] overflow-hidden",
              showAllDesc ? "max-h-full" : ""
            )}>
              {productDetail.descriptionHistory.map((desc, index) => (
                <div key={index} className={cn(
                  "mb-3",
                  index !== productDetail.descriptionHistory.length - 1 && "border-b border-gray-200 pb-3"
                )}>
                  <div className="text-xs text-gray-400 mb-1">{dateTimeFormat(desc.time)}</div>
                  <div dangerouslySetInnerHTML={{ __html: desc.description }}></div>
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
        )}
        <div className="mb-20">
          <div className="text-[30px] font-extrabold mb-2.5">Lịch sử đấu giá</div>
          <BidHistory />
        </div>
        <div>
          <div className="text-[30px] font-extrabold">Các sản phẩm khác</div>
          <OtherProduct />
        </div>
      </div>
    </>
  )
}