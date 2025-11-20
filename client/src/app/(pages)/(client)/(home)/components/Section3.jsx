"use client"

import { useEffect, useState } from "react"
import { ProductItem } from "../../components/ProductItem"
import { SectionHeader } from "./SectionHeader"
import { getSocket } from "@/lib/socket/socket"

export const Section3 = () => {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    const socket = getSocket();

    socket.emit("product:get", {});

    socket.on("product:list", (data) => {
      console.log("Received product list:", data);
      setProducts(data);
    });

    return () => {
      socket.off("product:list");
    };
  }, [])

  return (
    <>
      <div className="container mx-auto mt-[75px] border-b border-b-black pb-[120px] mb-[120px]">
        <SectionHeader
          title="Phiên đấu giá mới nhất"
          subtitle="Xem tất cả"
          link="#"
        />
        <div className="grid grid-cols-4 gap-[30px] mt-[50px]">
          {products.length > 0 && products.map((item, index) => (
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