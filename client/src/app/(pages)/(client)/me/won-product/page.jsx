"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { Clock, User, Package, Store, CheckCircle, XCircle, Truck, CreditCard, Star } from "lucide-react";
import { dateTimeFormat } from "@/utils/date";
import { HeaderTitle } from "../components/HeaderTitle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getMyWonOrders, rateOrder, getRatingStatus } from "@/lib/clientAPI/order";

const statusConfig = {
  pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-500", icon: CreditCard },
  pending_shipping: { label: "Chờ giao hàng", color: "bg-blue-500", icon: Package },
  pending_delivery: { label: "Đang giao", color: "bg-purple-500", icon: Truck },
  pending_rating: { label: "Chờ đánh giá", color: "bg-orange-500", icon: Star },
  completed: { label: "Hoàn thành", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "bg-red-500", icon: XCircle },
};

export default function MyWonProductPage() {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, order: null });
  const [wonList, setWonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStatus, setRatingStatus] = useState({});

  const fetchWonProducts = async () => {
    try {
      setLoading(true);
      const response = await getMyWonOrders();
      if (response.code === "success") {
        setWonList(response.data || []);
        
        // Fetch rating status for each order in pending_rating or completed status
        const statusPromises = (response.data || [])
          .filter(order => ["pending_rating", "completed"].includes(order.status))
          .map(async (order) => {
            try {
              const statusRes = await getRatingStatus(order.id_order);
              return { id_order: order.id_order, status: statusRes.data };
            } catch {
              return { id_order: order.id_order, status: null };
            }
          });
        
        const statuses = await Promise.all(statusPromises);
        const statusMap = {};
        statuses.forEach(s => {
          statusMap[s.id_order] = s.status;
        });
        setRatingStatus(statusMap);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm đã thắng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWonProducts();
  }, []);

  const [score, setScore] = useState(1);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenRatingDialog = (order) => {
    setScore(1);
    setComment("");
    setConfirmDialog({ open: true, order });
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập phản hồi của bạn trước khi đánh giá.");
      return;
    }

    if (comment.length > 500) {
      toast.error("Phản hồi không được vượt quá 500 ký tự.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await rateOrder(confirmDialog.order.id_order, score, comment);
      
      if (response.code === "success") {
        toast.success("Đánh giá thành công!");
        setConfirmDialog({ open: false, order: null });
        fetchWonProducts(); // Refresh data
      } else {
        toast.error(response.message || "Không thể đánh giá");
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const canRate = (order) => {
    const status = ratingStatus[order.id_order];
    return status?.canRate === true;
  };

  const hasRated = (order) => {
    const status = ratingStatus[order.id_order];
    return status?.hasRated === true;
  };

  return (
    <>
      <HeaderTitle title="Danh sách sản phẩm đã thắng đấu giá" />

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : wonList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Bạn chưa thắng đấu giá sản phẩm nào
        </div>
      ) : (
        <div className="space-y-4">
          {wonList.map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Package;
            return (
              <div
                key={order.id_order}
                className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${order.id_product}`}>
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition">
                      <img
                        src={order.product_avatar || "/placeholder.png"}
                        alt={order.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Link href={`/product/${order.id_product}`}>
                        <h3 className="text-lg font-bold hover:text-[var(--main-color)] transition">
                          {order.product_name}
                        </h3>
                      </Link>
                      <Badge className={`${statusConfig[order.status]?.color || "bg-gray-500"} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>Người bán: <strong>{order.seller_name || "N/A"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Thời gian thắng: <strong>{dateTimeFormat(order.created_at)}</strong></span>
                      </div>
                      <div className="col-span-2">
                        <span>Giá thắng: <strong className="text-[var(--main-color)] text-lg">{parseInt(order.final_price).toLocaleString("vi-VN")} VND</strong></span>
                      </div>
                    </div>

                    {/* Rating status */}
                    {hasRated(order) && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Bạn đã đánh giá người bán
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/me/orders/${order.id_product}`}>
                      <Button variant="outline" className="w-full">
                        Xem chi tiết
                      </Button>
                    </Link>
                    
                    {canRate(order) && (
                      <Button
                        className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]"
                        onClick={() => handleOpenRatingDialog(order)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Đánh giá người bán
            </AlertDialogTitle>
            <AlertDialogDescription>
              Đánh giá cho sản phẩm: <strong>{confirmDialog.order?.product_name}</strong>
              <br />
              Người bán: <strong>{confirmDialog.order?.seller_name}</strong>
            </AlertDialogDescription>
            <div className="mt-5">
              <RadioGroup 
                className="gap-2" 
                defaultValue="1" 
                value={String(score)}
                onValueChange={(value) => setScore(parseInt(value))}
              >
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-green-500 has-data-[state=checked]:bg-green-50">
                  <RadioGroupItem
                    className="order-1 after:absolute after:inset-0"
                    id="rate-positive"
                    value="1"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor="rate-positive" className="text-green-600 font-semibold">
                      +1 Đánh giá tích cực
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Bạn hài lòng với người bán và sẵn sàng giao dịch với họ trong tương lai.
                    </p>
                  </div>
                </div>
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-red-500 has-data-[state=checked]:bg-red-50">
                  <RadioGroupItem
                    className="order-1 after:absolute after:inset-0"
                    id="rate-negative"
                    value="-1"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor="rate-negative" className="text-red-600 font-semibold">
                      -1 Đánh giá tiêu cực
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Bạn không hài lòng với người bán và không muốn giao dịch với họ trong tương lai.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              <Textarea
                placeholder="Viết phản hồi của bạn ở đây... (tối đa 500 ký tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-5 h-[150px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/500</p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]"
              onClick={(e) => {
                e.preventDefault();
                handleSubmitReview();
              }}
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Gửi đánh giá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
