"use client"

import { useEffect, useState } from "react"
import { ProductItem } from "../../../components/ProductItem/ProductItem"
import { clientProductListByCategory } from "@/lib/clientAPI/product"
import { ProductItemSkeleton } from "../../../components/ProductItem/ProductItemSkeleton"

export const OtherProduct = ({ categoryID }) => {
  const [productList, setProductList] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientProductListByCategory(categoryID, "", "normal", 4);
      if (promise.code == "success") {
        setProductList(promise.productList);
      }
    }
    fetchData();
  }, [])

  return (
    <>
      <div className="grid grid-cols-4 gap-[30px] mt-2.5">
        {productList.length > 0 ? productList.slice(0, 4).map((item, index) => (
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
    </>
  )
}