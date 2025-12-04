"use client"

import { useEffect, useState } from "react"
import { ProductItem } from "../../components/ProductItem"
import { SectionHeader } from "./SectionHeader"
import { getSocket } from "@/lib/socket/socket"

export const Section3 = () => {
  const data = [
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
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
  ]

  const [products, setProducts] = useState([])

  // useEffect(() => {
  //   const socket = getSocket();

  //   socket.emit("product:get", {});

  //   socket.on("product:list", (data) => {
  //     console.log("Received product list:", data);
  //     setProducts(data);
  //   });

  //   return () => {
  //     socket.off("product:list");
  //   };
  // }, [])

  return (
    <>
      <div className="container mx-auto mt-[75px] border-b border-b-black pb-[120px] mb-[120px]">
        <SectionHeader
          title="Phiên đấu giá mới nhất"
          subtitle="Xem tất cả"
          link="#"
        />
        <div className="grid grid-cols-4 gap-[30px] mt-[50px]">
          {data.map((item, index) => (
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