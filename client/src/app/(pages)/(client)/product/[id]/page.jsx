"use client"

import { useEffect, useState } from "react";
import { BidHistory } from "./components/BidHistory";
import { ImageSlider } from "./components/ImageSlider";
import { OtherProduct } from "./components/OtherProduct";
import { ProdcutInformation } from "./components/ProductInformation";
import { useParams } from "next/navigation";
import { clientProductDetail } from "@/lib/clientAPI/product";

export default function ProductPage() {
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);

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