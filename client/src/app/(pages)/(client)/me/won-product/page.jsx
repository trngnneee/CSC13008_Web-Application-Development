"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { Clock, User, Package } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function MyWinBidPage() {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [bidList, setBidList] = useState([
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

  const [point, setPoint] = useState(-1);
  const [feedBack, setFeedback] = useState("");
  const handleSubmitReview = () => {
    if (feedBack == "") {
      toast.error("Vui lòng nhập phản hồi của bạn trước khi đánh giá.");
      return;
    }
    setConfirmDialog({ open: false, id: null });
    console.log("Submitting review:", {
      id_bid: confirmDialog.id,
      point,
      feedBack,
    });
  }

  return (
    <>
      <HeaderTitle title="Danh sách đấu giá đã thắng của tôi" />

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : bidList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Chưa có lượt đấu giá nào
        </div>
      ) : (
        <div className="space-y-4">
          {bidList.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
            >
              <div
                className="bg-white hover:bg-gray-100 rounded-lg shadow-md p-5 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.product_avatar || "/placeholder.png"}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{product.product_name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Người đấu giá: <strong>{product.bidder_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Email: <strong>{product.bidder_email}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Thời gian: <strong>{dateTimeFormat(product.created_at)}</strong></span>
                      </div>
                      <div>
                        <span>Giá đề xuất: <strong className="text-[var(--main-client-color)]">{parseInt(product.bid_price).toLocaleString("vi-VN")} VND</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      className={"bg-[var(--main-color)]"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDialog({ open: true, id: product.id });
                      }}
                    >Đánh giá người bán</Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Đánh giá người bán
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng đánh giá người bán sau khi hoàn tất giao dịch để giúp cộng đồng người dùng có trải nghiệm tốt hơn.
            </AlertDialogDescription>
            <div className="mt-5">
              <RadioGroup className="gap-2" defaultValue="1" onValueChange={(value) => setPoint(parseInt(value))}>
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                  <RadioGroupItem
                    className="order-1 after:absolute after:inset-0"
                    id={`-1`}
                    value="-1"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor={`-1`}>
                      -1{" "}
                      <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                        (Đánh giá tiêu cực)
                      </span>
                    </Label>
                    <p
                      className="text-muted-foreground text-xs"
                      id={`-1`}
                    >
                      Bạn không hài lòng với người bán và không muốn giao dịch với họ trong tương lai.
                    </p>
                  </div>
                </div>
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                  <RadioGroupItem
                    className="order-1 after:absolute after:inset-0"
                    id={`1`}
                    value="1"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor={`1`}>
                      +1{" "}
                      <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                        (Đánh giá tích cực)
                      </span>
                    </Label>
                    <p
                      className="text-muted-foreground text-xs"
                      id={`1`}
                    >
                      Bạn hài lòng với người bán và sẵn sàng giao dịch với họ trong tương lai.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              <Textarea
                placeholder="Viết phản hồi của bạn ở đây..."
                value={feedBack}
                onChange={(e) => setFeedback(e.target.value)}
                className={"mt-5 h-[200px]"}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]"
              onClick={handleSubmitReview}
            >
              Đánh giá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
