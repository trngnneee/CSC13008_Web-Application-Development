"use client"

import { useEffect, useState } from "react"
import { ProductItem } from "../../components/ProductItem"
import { SectionHeader } from "./SectionHeader"
import { clientProductListTopPrice } from "@/lib/clientAPI/product"

export const Section3 = () => {
  const [productList, setProductList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientProductListTopPrice();
      if (promise.code == "success")
      {
        setProductList(promise.productList);
      }
    }
    fetchData();
  }, [])

  return (
    <>
      <div className="container mx-auto mt-[75px] border-b border-b-black pb-[120px] mb-[120px]">
        <SectionHeader
          title="Sản phẩm có giá cao nhất"
          subtitle="Xem tất cả"
          link="#"
        />
        <div className="grid grid-cols-4 gap-[30px] mt-[50px]">
          {productList.length > 0 && productList.map((item, index) => (
            <ProductItem
              key={index}
              item={item}
            />
          ))}
        </div>
      </div>
    </>
  )
}