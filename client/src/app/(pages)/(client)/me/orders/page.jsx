"use client"

import { useEffect, useState } from "react";
import { getMyWonOrders } from "@/lib/clientAPI/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dateTimeFormat } from "@/utils/date";

const statusLabels = {
  pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-500" },
  pending_shipping: { label: "Chờ giao hàng", color: "bg-blue-500" },
  pending_delivery: { label: "Đang giao", color: "bg-purple-500" },
  pending_rating: { label: "Chờ đánh giá", color: "bg-orange-500" },
  completed: { label: "Hoàn thành", color: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-500" },
};

export default function MyWonOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await getMyWonOrders();
      if (response.code === "success") {
        setOrders(response.data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng đã thắng đấu giá</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Bạn chưa thắng đấu giá sản phẩm nào
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id_order} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex gap-4">
                <img
                  src={order.product_avatar || "/placeholder.png"}
                  alt={order.product_name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{order.product_name}</h3>
                  <p className="text-gray-600">Người bán: {order.seller_name}</p>
                  <p className="text-[var(--main-color)] font-bold">
                    {parseInt(order.final_price).toLocaleString("vi-VN")} VND
                  </p>
                  <div className="mt-2">
                    <Badge className={statusLabels[order.status]?.color || "bg-gray-500"}>
                      {statusLabels[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link href={`/me/orders/${order.id_order}`}>
                    <Button>Xem chi tiết</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
