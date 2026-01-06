"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { clientProductGetBidHistory } from "@/lib/clientAPI/product";
import { dateTimeFormat } from "@/utils/date";

export const BidHistory = () => {
  const params = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBidHistory = async () => {
      try {
        setLoading(true);
        const result = await clientProductGetBidHistory(params.id);
        setBids(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBidHistory();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Đang tải lịch sử đấu giá...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Chưa có lượt đấu giá nào
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Người đấu giá</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Thời gian đấu giá</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{bid.bidder_display}</td>
                <td className="px-4 py-3 font-medium">
                  {Number(bid.bid_price).toLocaleString("vi-VN")} VND
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {dateTimeFormat(bid.time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};