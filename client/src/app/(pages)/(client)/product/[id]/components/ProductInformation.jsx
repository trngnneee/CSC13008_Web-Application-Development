"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart, AlertTriangle } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat, getRelativeEndTime } from "@/utils/date";
import { WishListButton } from "../../../components/WishlistButton";
import { placeBid } from "@/lib/clientAPI/bid";
import { toastHandler } from "@/lib/toastHandler";
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
import { toast } from "sonner";
import { FeedbackList } from "./FeedbackList";

export const ProdcutInformation = ({ productDetail }) => {
  const { isLogin, userInfo } = useClientAuthContext();
  const [bidPrice, setBidPrice] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isSellerDeleted = productDetail?.seller_status === 'inactive';

  // Tính giá đấu tối thiểu
  const minBidPrice = productDetail ?
    parseInt(productDetail.price) + parseInt(productDetail.pricing_step || 0) : 0;

  const handlePlaceBidClick = () => {
    if (!bidPrice || Number(bidPrice) <= 0) {
      toast.error("Vui lòng nhập giá đấu hợp lệ");
      return;
    }

    if (!userInfo || !userInfo.id_user) {
      toast.error("Vui lòng đăng nhập để đấu giá");
      return;
    }

    // Kiểm tra giá tối thiểu ở frontend
    if (Number(bidPrice) < minBidPrice) {
      toast.error(`Giá đấu phải lớn hơn hoặc bằng ${minBidPrice.toLocaleString("vi-VN")} VND`);
      return;
    }

    // Hiển thị dialog xác nhận
    setShowConfirmDialog(true);
  };

  const handleConfirmBid = async () => {
    setShowConfirmDialog(false);
    setBidLoading(true);
    try {
      const result = await placeBid(productDetail.id_product, Number(bidPrice), userInfo.id_user);
      toast.success(result.message || "Đấu giá thành công");
      setBidPrice("");
    } catch (error) {
      toast.error(error.message || "Đấu giá thất bại");
    } finally {
      setBidLoading(false);
    }
  };

  // Đặt giá đề nghị tối thiểu khi click
  const handleSetMinBid = () => {
    setBidPrice(minBidPrice.toString());
  };

  return (
    <>
      {productDetail && (
        <div className="relative w-1/2">
          <div className="w-[200px] h-[200px] overflow-hidden absolute -top-[50px] -left-[100px] z-5">
            <img
              src="/shape1.png"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="z-10 border-b-2 border-black pb-[30px]">
            <div className="text-[30px] font-extrabold  mb-6">{productDetail.name}</div>
            {isSellerDeleted ? (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Người bán đã bị xóa</span>
              </div>
            ) : (
              <>
                <div className="text-[20px] ">Người bán: <span className="font-extrabold">{productDetail.seller}</span></div>
                <div><FeedbackList role={"bidder"} /></div>
                <div className="text-[20px]">Liên hệ: <span className="font-extrabold">{productDetail.seller_email}</span></div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="text-[14px] font-bold"><span className="">Giá khởi điểm:</span> <span className="text-[var(--main-client-color)] text-[16px]">{parseInt(productDetail.starting_price).toLocaleString("vi-VN")} VND</span></div>
              <div className="text-[14px] font-bold"><span className="">Giá hiện tại:</span> <span className="text-[var(--main-client-color)] text-[16px]">{parseInt(productDetail.price).toLocaleString("vi-VN")} VND</span></div>
              <div className="text-[14px] font-bold"><span className="">Giá mua ngay:</span> <span className="text-[var(--main-client-color)] text-[16px]">{parseInt(productDetail.immediate_purchase_price).toLocaleString("vi-VN")} VND</span></div>
              <div className="text-[14px] font-bold"><span className="">Bước giá:</span> <span className="text-[var(--main-client-color)] text-[16px]">{parseInt(productDetail.pricing_step).toLocaleString("vi-VN")} VND</span></div>
            </div>

            <div className="text-[15px] mt-[30px] font-bold">Thời điểm đăng: <span className="font-light">{dateTimeFormat(productDetail.posted_date_time)}</span></div>
            <div className="text-[15px] font-bold">Phiên đấu giá kết thúc tại: <span className="font-light">{productDetail.end_date_time ? dateTimeFormat(productDetail.end_date_time) : "-"}</span></div>
            {isLogin && (
              <div className="flex items-center gap-5 justify-between">
                <div className="mt-[30px] w-full">
                  <div className="mb-3 p-3 bg-gray-100 border border-[var(--main-client-color)] rounded-lg">
                    <span className="text-[var(--main-client-color)] font-light text-[16px]">
                      Giá đấu tối thiểu: <span className="font-extrabold text-[20px]">{minBidPrice.toLocaleString("vi-VN")} VND</span>
                    </span>
                    <Button
                      variant="link"
                      className="text-[var(--main-client-color)] text-[16px] p-0 ml-2 h-auto -translate-y-0.5 cursor-pointer"
                      onClick={handleSetMinBid}
                    >
                      Đặt giá này
                    </Button>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* <div><DollarSign /></div> */}
                    <Input
                      type="number"
                      placeholder="Nhập số tiền đấu giá"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      disabled={!isLogin || bidLoading}
                      min={minBidPrice}
                    />
                    <div className="flex gap-3 items-center">
                      <Button
                        onClick={handlePlaceBidClick}
                        disabled={!isLogin || bidLoading}
                        className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/90 text-white"
                      >
                        {bidLoading ? "Đang gửi..." : "Đấu giá"}
                      </Button>
                      <WishListButton
                        onClickSuccess={(e) => {
                          e.stopPropagation();
                        }}
                        id={productDetail.id_product}
                        showTitle={false}
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <p className="text-red-500 text-sm mt-2">Vui lòng đăng nhập để đấu giá</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dialog xác nhận đấu giá */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận đấu giá</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đặt giá <span className="font-bold text-[var(--main-client-color)]">{Number(bidPrice).toLocaleString("vi-VN")} VND</span> cho sản phẩm này?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmBid}
                  className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/90"
                >
                  Xác nhận đấu giá
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  )
}