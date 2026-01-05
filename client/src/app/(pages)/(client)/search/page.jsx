"use client"

import { useSearchParams } from "next/navigation"
import { ProductItem } from "../components/ProductItem/ProductItem"
import { useEffect, useState } from "react";
import { clientProductSearch } from "@/lib/clientAPI/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductItemSkeleton } from "../components/ProductItem/ProductItemSkeleton";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [status, setStatus] = useState("normal");

  const [productList, setProductList] = useState([]);
  const [newProductMinutes, setNewProductMinutes] = useState(30);
  const [newProductCount, setNewProductCount] = useState(0);
  
  useEffect(() => {
    setProductList([]);
    const fetchData = async () => {
      const promise = await clientProductSearch(keyword, status);
      if (promise.code == "success") {
        setProductList(promise.productList);
        if (promise.newProductMinutes) {
          setNewProductMinutes(promise.newProductMinutes);
        }
        // Đếm số sản phẩm mới
        const newCount = promise.productList.filter(p => p.is_new).length;
        setNewProductCount(newCount);
      }
    };
    fetchData();
  }, [keyword, status]);

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
        
        {/* Thông báo sản phẩm mới */}
        {newProductCount > 0 && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">
              Có <Badge className="bg-red-500 text-white mx-1">{newProductCount}</Badge> sản phẩm mới đăng trong {newProductMinutes} phút gần đây
            </span>
          </div>
        )}

        <div className="my-5 w-[300px] flex justify-end">
          <Select onValueChange={(value) => setStatus(value)} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">-- Sắp xếp theo --</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="end-desc">Thời gian kết thúc giảm dần</SelectItem>
              <SelectItem value="end-asc">Thời gian kết thúc tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 gap-[30px] mb-[30px]">
          {productList.length > 0 ? productList.map((item, index) => (
            <ProductItem
              key={index}
              item={item}
              newProductMinutes={newProductMinutes}
            />
          )) : (
            [...Array(8)].map((_, index) => (
              <ProductItemSkeleton 
                key={index}
                item={{}}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}