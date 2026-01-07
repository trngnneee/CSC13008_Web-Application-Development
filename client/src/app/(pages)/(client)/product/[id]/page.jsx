"use client"

import { useEffect, useState } from "react";
import { BidHistory } from "./components/BidHistory";
import { ImageSlider } from "./components/ImageSlider";
import { OtherProduct } from "./components/OtherProduct";
import { ProdcutInformation } from "./components/ProductInformation";
import { useParams } from "next/navigation";
import { clientProductDetail } from "@/lib/clientAPI/product";
import { ProductDescription } from "./components/ProductDescription";
import { CommentSection } from "./components/CommentSection";
import { BidRequest } from "./components/BidRequest";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { BidderList } from "./components/BidderList";

export default function ProductPage() {
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const { userInfo } = useClientAuthContext();

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
        <div className="flex gap-[100px] mb-[30px]">
          <ImageSlider imageList={productDetail && productDetail.url_img} />
          <ProdcutInformation productDetail={productDetail} />
        </div>
        {productDetail && (
          <ProductDescription descriptionHistory={productDetail.descriptionHistory} />
        )}
        <div className="my-[50px]">
          <div className="text-[30px] font-extrabold mb-2.5">Lịch sử đấu giá:</div>
          <BidHistory />
          {userInfo && productDetail && 
            (productDetail.updated_by === userInfo.id_user || productDetail.created_by === userInfo.id_user) && (
            <>
              <div className="text-[30px] font-extrabold mb-2.5 mt-10">Danh sách đấu giá chờ duyệt của Bidder:</div>
              <BidRequest />
              <div className="text-[30px] font-extrabold mb-2.5 mt-10">Danh sách Bidder tham gia:</div>
              <BidderList />
            </>
          )}
        </div>
        <CommentSection />
        {productDetail && (
          <div>
            <div className="text-[30px] font-extrabold">Các sản phẩm khác cùng danh mục</div>
            <OtherProduct categoryID={productDetail.id_category} />
          </div>
        )}
      </div>
    </>
  )
}