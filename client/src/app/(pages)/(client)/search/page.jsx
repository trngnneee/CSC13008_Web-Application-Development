"use client"

import { useSearchParams } from "next/navigation"
import { ProductItem } from "../components/ProductItem"
import { useEffect, useState } from "react";
import { clientProductSearch } from "@/lib/clientAPI/product";

export default function SearchPage() {
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

  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");

  const [productList, setProductList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientProductSearch(keyword);
      if (promise.code == "success")
      {
        setProductList(promise.productList);
      }
    };
    fetchData();
  }, [keyword]);

  return (
    <>
      <div className="w-full overflow-hidden relative h-[100px]">
        <img
          src="/shape3.svg"
          className="w-full h-full object-cover"
        />
        <div className="text-white text-[80px] font-extrabold absolute bottom-1/2 translate-y-1/2 left-0 translate-x-1/5">Kết quả tìm kiếm</div>
      </div>
      <div className="container mx-auto my-[50px]">
        <div className="text-[35px] font-extrabold mb-[30px]">Kết quả tìm kiếm cho: <span>"{keyword}"</span></div>
        <div className="grid grid-cols-4 gap-[30px] mb-[30px]">
          {productList.length > 0 &&productList.map((item, index) => (
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