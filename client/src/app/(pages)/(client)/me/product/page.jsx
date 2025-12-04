"use client"

import { HeaderTitle } from "../components/HeaderTitle";
import { dateFormat } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Pen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerProductPage(){
  const router = useRouter();

  const data = [
    {
      id_product: 1,
      name: "Sản phẩm 1",
      avatar: "https://via.placeholder.com/150",
      name_category: "Danh mục A",
      starting_price: 80000,
      immediate_purchase_price: 120000,
      posted_date_time: "2024-06-01T10:00:00Z",
      end_date_time: "2024-06-10T10:00:00Z",
      pricing_step: 5000
    },
    {
      id_product: 2,
      name: "Sản phẩm 2",
      avatar: "https://via.placeholder.com/150",
      name_category: "Danh mục B",
      starting_price: 150000,
      immediate_purchase_price: 250000,
      posted_date_time: "2024-06-02T11:00:00Z",
      end_date_time: "2024-06-12T11:00:00Z",
      pricing_step: 10000
    }
  ]
  
  return (
    <div>
      <HeaderTitle title="Danh sách sản phẩm của tôi" />
      <div>
        <Button onClick={() => router.push("/me/product/create")} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] font-bold mt-5"><Plus/> Tạo sản phẩm mới</Button>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <table className="min-w-full text-[12px] text-gray-700">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th className="p-3 text-left">Tên sản phẩm</th>
            <th className="p-3 text-center">Ảnh</th>
            <th className="p-3 text-center">Danh mục</th>
            <th className="p-3 text-center">Giá khởi điểm</th>
            <th className="p-3 text-center">Giá mua ngay</th>
            <th className="p-3 text-center">Bước nhảy</th>
            <th className="p-3 text-center">Bắt đầu</th>
            <th className="p-3 text-center">Kết thúc</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 && data.map((item) => (
            <tr
              key={item.id_product}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">{item.name}</td>
              <td className="p-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
              </td>
              <td className="p-3 text-center">{item.name_category}</td>
              <td className="p-3 text-center">{parseInt(item.starting_price).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center">{parseInt(item.immediate_purchase_price).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center">{parseInt(item.pricing_step).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{dateFormat(new Date(item.posted_date_time))}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{dateFormat(new Date(item.end_date_time))}</td>
              <td className="p-3 flex items-center justify-center gap-2">
                <Button onClick={() => router.push(`/me/product/update/${item.id_product}`)} className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] p-0 w-8 h-8"}>
                  <Pen />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}