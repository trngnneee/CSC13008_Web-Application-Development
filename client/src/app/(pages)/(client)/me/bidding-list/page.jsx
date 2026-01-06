"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, Trophy, TrendingUp, Eye, Timer, Users } from "lucide-react";

import { HeaderTitle } from "../components/HeaderTitle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyBiddingProducts } from "@/lib/clientAPI/bid";

const formatCurrency = (value) => {
  return parseInt(value || 0).toLocaleString("vi-VN") + " VND";
};

export default function BiddingListPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBiddingProducts();
  }, []);

  const fetchBiddingProducts = async () => {
    try {
      setLoading(true);
      const response = await getMyBiddingProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching bidding products:", error);
      toast.error("Không thể tải danh sách sản phẩm đang đấu giá");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endDateTime) => {
    if (!endDateTime) return "Không xác định";
    
    const now = new Date();
    const end = new Date(endDateTime);
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getTimeRemainingColor = (endDateTime) => {
    if (!endDateTime) return "bg-gray-500";
    
    const now = new Date();
    const end = new Date(endDateTime);
    const diff = end - now;

    if (diff <= 0) return "bg-red-500";
    if (diff <= 1000 * 60 * 60) return "bg-red-500"; // < 1 hour
    if (diff <= 1000 * 60 * 60 * 24) return "bg-orange-500"; // < 1 day
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="w-full">
        <HeaderTitle title="Sản phẩm đang tham gia đấu giá" />
        <div className="mt-6 text-center py-10">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <HeaderTitle title="Sản phẩm đang tham gia đấu giá" />

      {products.length === 0 ? (
        <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Chưa tham gia đấu giá
          </h3>
          <p className="mt-2 text-gray-500">
            Bạn chưa tham gia đấu giá sản phẩm nào đang hoạt động.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 bg-[var(--main-client-color)]"
          >
            Khám phá sản phẩm
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {products.map((product) => (
            <div 
              key={product.id_product} 
              className={`bg-white rounded-lg shadow-md p-5 border hover:shadow-lg transition-shadow ${
                product.is_user_leading ? "border-green-300 bg-green-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link href={`/product/${product.id_product}`} className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={product.avatar || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {product.is_user_leading && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-500 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Đang thắng
                      </Badge>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${product.id_product}`}
                    className="text-lg font-semibold text-gray-900 hover:text-[var(--main-client-color)] line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  {/* Bid Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>
                        Giá hiện tại:{" "}
                        <strong className="text-blue-600">
                          {formatCurrency(product.current_price)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>
                        Lượt đấu giá: <strong>{product.bid_count}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>
                        Người dẫn đầu:{" "}
                        <strong className={product.is_user_leading ? "text-green-600" : "text-gray-600"}>
                          {product.is_user_leading ? "Bạn" : product.current_highest_bidder || "---"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <Badge className={getTimeRemainingColor(product.end_date_time)}>
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(product.end_date_time)}
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-3 flex items-center justify-between">
                    {/* Status Message */}
                    {product.is_user_leading ? (
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Bạn đang dẫn đầu cuộc đấu giá này!
                      </p>
                    ) : (
                      <p className="text-sm text-orange-600 font-medium">
                        ⚠️ Bạn đang bị vượt giá! Hãy đặt giá cao hơn.
                      </p>
                    )}

                    <Link href={`/product/${product.id_product}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {products.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Tổng cộng: <strong>{products.length}</strong> sản phẩm đang đấu giá
            </span>
            <span className="text-green-600">
              Đang dẫn đầu: <strong>{products.filter(p => p.is_user_leading).length}</strong> sản phẩm
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
