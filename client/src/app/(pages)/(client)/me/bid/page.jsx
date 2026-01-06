"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { Clock, User, Package } from "lucide-react";
import { dateTimeFormat } from "@/utils/date";
import { HeaderTitle } from "../components/HeaderTitle";
import Link from "next/link";

export default function MyBidPage() {
  const [bidList, setBidRequests] = useState([
    {
      id: 1,
      product_name: "Sản phẩm A",
      product_avatar: "/category1.jpg",
      bidder_name: "Nguyễn Văn A",
      bidder_email: "nguyenvana@example.com",
      created_at: "2024-06-01T10:00:00Z",
      bid_price: 1500000,
      status: "pending",
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyBid = () => {

    }
  }, []);

  return (
    <>
      <HeaderTitle title="Yêu cầu đấu giá của tôi" />

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : bidList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Chưa có lượt đấu giá nào
        </div>
      ) : (
        <div className="space-y-4">
          {bidList.map((request) => (
            <Link
              href={`/product/${request.id}`}
              key={request.id}
            >
              <div
                className="bg-white hover:bg-gray-100 rounded-lg shadow-md p-5 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={request.product_avatar || "/placeholder.png"}
                      alt={request.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{request.product_name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Người đấu giá: <strong>{request.bidder_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Email: <strong>{request.bidder_email}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Thời gian: <strong>{dateTimeFormat(request.created_at)}</strong></span>
                      </div>
                      <div>
                        <span>Giá đề xuất: <strong className="text-[var(--main-client-color)]">{parseInt(request.bid_price).toLocaleString("vi-VN")} VND</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
