"use client"

import { ApproveBidRequestButton } from "./ApproveBidRequestButton";
import { RejectBidRequestButton } from "./RejectBidRequestButton";
import { useEffect, useState } from "react";
import { getBidRequestsByProduct } from "@/lib/clientAPI/bid";
import { useParams } from "next/navigation";
import { dateTimeFormat } from "@/utils/date";

export const BidRequest = () => {
  const { id } = useParams();
  const [bidRequests, setBidRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBidRequests = async () => {
    setLoading(true);
    const response = await getBidRequestsByProduct(id);
    if (response.code === "success") {
      setBidRequests(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchBidRequests();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (bidRequests.length === 0) {
    return <div className="text-center py-4 text-gray-500">Không có yêu cầu đấu giá nào đang chờ duyệt</div>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Người đấu giá</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Thời gian yêu cầu</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bidRequests.map((request) => (
              <tr
                key={request.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{request.bidder_name}</td>
                <td className="px-4 py-3 text-gray-600">{request.bidder_email}</td>
                <td className="px-4 py-3 font-medium">
                  {parseInt(request.bid_price).toLocaleString("vi-VN")} VND
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {dateTimeFormat(request.created_at)}
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <ApproveBidRequestButton 
                    id_request={request.id}
                    onSuccess={fetchBidRequests}
                  />
                  <RejectBidRequestButton 
                    id_request={request.id}
                    onSuccess={fetchBidRequests}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}