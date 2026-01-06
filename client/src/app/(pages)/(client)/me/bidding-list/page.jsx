"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, Trophy, TrendingUp, Eye, Timer } from "lucide-react";

import { HeaderTitle } from "../components/HeaderTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="mt-6 grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-32 h-32 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
        <div className="mt-6 grid gap-4">
          {products.map((product) => (
            <Card key={product.id_product} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={product.product_avatar || "/placeholder.png"}
                      alt={product.product_name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {product.is_winning && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          Đang thắng
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.id_product}`}
                      className="text-lg font-semibold text-gray-900 hover:text-[var(--main-client-color)] line-clamp-2"
                    >
                      {product.product_name}
                    </Link>

                    <p className="text-sm text-gray-500 mt-1">
                      Người bán: {product.seller_name || "Không xác định"}
                    </p>

                    {/* Bid Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>
                          Giá cao nhất:{" "}
                          <strong className="text-blue-600">
                            {formatCurrency(product.highest_bid)}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-green-500" />
                        <span>
                          Giá của bạn:{" "}
                          <strong className={product.is_winning ? "text-green-600" : "text-orange-600"}>
                            {formatCurrency(product.my_highest_bid)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        <Badge className={getTimeRemainingColor(product.end_date_time)}>
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeRemaining(product.end_date_time)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Đã đặt {product.my_bid_count} lần
                        </span>
                        <Link href={`/product/${product.id_product}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Status Message */}
                    {!product.is_winning && (
                      <p className="mt-2 text-sm text-orange-600 font-medium">
                        ⚠️ Bạn đang bị vượt giá! Hãy đặt giá cao hơn để giành chiến thắng.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
              Đang thắng: <strong>{products.filter(p => p.is_winning).length}</strong> sản phẩm
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
