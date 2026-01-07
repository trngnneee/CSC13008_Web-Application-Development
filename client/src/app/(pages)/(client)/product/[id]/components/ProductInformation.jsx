"use client"

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart, AlertTriangle, Clock, Zap, TrendingUp, TrendingDown, Settings2, X, Info } from "lucide-react";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { dateTimeFormat, getRelativeEndTime } from "@/utils/date";
import { WishListButton } from "../../../components/WishlistButton";
import { placeBid, placeAutoBid, getAutoBid, deleteAutoBid } from "@/lib/clientAPI/bid";
import { toastHandler } from "@/lib/toastHandler";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const ProdcutInformation = ({ productDetail }) => {
  const { isLogin, userInfo } = useClientAuthContext();
  const [bidPrice, setBidPrice] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Auto-bid states
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  const [autoBidMaxPrice, setAutoBidMaxPrice] = useState("");
  const [autoBidLoading, setAutoBidLoading] = useState(false);
  const [currentAutoBid, setCurrentAutoBid] = useState(null);
  const [autoBidFetching, setAutoBidFetching] = useState(false);
  
  // Countdown state
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  
  // Bidding status
  const [isLeading, setIsLeading] = useState(false);
  const [autoBidExceeded, setAutoBidExceeded] = useState(false);

  const isSellerDeleted = productDetail?.seller_status === 'inactive';
  const isOwnProduct = userInfo && productDetail && 
    (productDetail.updated_by === userInfo.id_user || productDetail.created_by === userInfo.id_user);

  // Tính giá đấu tối thiểu
  const currentPrice = productDetail ? parseInt(productDetail.price || productDetail.starting_price || 0) : 0;
  const pricingStep = productDetail ? parseInt(productDetail.pricing_step || 0) : 0;
  const minBidPrice = currentPrice + pricingStep;
  
  // Auction status
  const auctionStatus = productDetail?.status;
  const isAuctionActive = auctionStatus === 'active';

  // Fetch auto-bid status
  const fetchAutoBid = useCallback(async () => {
    if (!productDetail?.id_product || !userInfo?.id_user) return;
    
    setAutoBidFetching(true);
    try {
      const result = await getAutoBid(productDetail.id_product);
      setCurrentAutoBid(result.data);
      
      // Check if auto-bid exceeded
      if (result.data && currentPrice >= result.data.max_bid) {
        setAutoBidExceeded(true);
      } else {
        setAutoBidExceeded(false);
      }
    } catch (error) {
      console.error("Failed to fetch auto-bid:", error);
    } finally {
      setAutoBidFetching(false);
    }
  }, [productDetail?.id_product, userInfo?.id_user, currentPrice]);

  // Countdown timer
  useEffect(() => {
    if (!productDetail?.end_date_time) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(productDetail.end_date_time);
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeRemaining("Đã kết thúc");
        setIsAuctionEnded(true);
        return;
      }
      
      setIsAuctionEnded(false);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [productDetail?.end_date_time]);

  // Fetch auto-bid on mount and when product changes
  useEffect(() => {
    if (isLogin && productDetail?.id_product) {
      fetchAutoBid();
    }
  }, [isLogin, productDetail?.id_product, fetchAutoBid]);

  // Check if user is leading (simplified - in real app would need bid history)
  useEffect(() => {
    if (productDetail?.highest_bidder_id && userInfo?.id_user) {
      setIsLeading(productDetail.highest_bidder_id === userInfo.id_user);
    }
  }, [productDetail?.highest_bidder_id, userInfo?.id_user]);

  const handlePlaceBidClick = () => {
    if (!bidPrice || Number(bidPrice) <= 0) {
      toast.error("Vui lòng nhập giá đấu hợp lệ");
      return;
    }

    if (!userInfo || !userInfo.id_user) {
      toast.error("Vui lòng đăng nhập để đấu giá");
      return;
    }

    if (Number(bidPrice) < minBidPrice) {
      toast.error(`Giá đấu phải lớn hơn hoặc bằng ${minBidPrice.toLocaleString("vi-VN")} VND`);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmBid = async () => {
    setShowConfirmDialog(false);
    setBidLoading(true);
    try {
      const result = await placeBid(productDetail.id_product, Number(bidPrice), userInfo.id_user);
      toast.success(result.message || "Đấu giá thành công");
      setBidPrice("");
      // Refresh page to get updated price
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Đấu giá thất bại");
    } finally {
      setBidLoading(false);
    }
  };

  const handleSetMinBid = () => {
    setBidPrice(minBidPrice.toString());
  };

  // Auto-bid handlers
  const handleOpenAutoBidModal = () => {
    if (currentAutoBid) {
      setAutoBidMaxPrice(currentAutoBid.max_bid.toString());
    } else {
      setAutoBidMaxPrice(minBidPrice.toString());
    }
    setShowAutoBidModal(true);
  };

  const handleConfirmAutoBid = async () => {
    if (!autoBidMaxPrice || Number(autoBidMaxPrice) <= 0) {
      toast.error("Vui lòng nhập giá tối đa hợp lệ");
      return;
    }

    if (Number(autoBidMaxPrice) < minBidPrice) {
      toast.error(`Giá auto-bid tối thiểu phải là ${minBidPrice.toLocaleString("vi-VN")} VND`);
      return;
    }

    setAutoBidLoading(true);
    try {
      const result = await placeAutoBid(productDetail.id_product, Number(autoBidMaxPrice));
      toast.success(result.message || "Đặt auto-bid thành công");
      setShowAutoBidModal(false);
      await fetchAutoBid();
      // Refresh page to get updated price
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Đặt auto-bid thất bại");
    } finally {
      setAutoBidLoading(false);
    }
  };

  const handleCancelAutoBid = async () => {
    if (!currentAutoBid) return;
    
    setAutoBidLoading(true);
    try {
      await deleteAutoBid(productDetail.id_product);
      toast.success("Đã hủy auto-bid");
      setCurrentAutoBid(null);
      setAutoBidExceeded(false);
    } catch (error) {
      toast.error(error.message || "Hủy auto-bid thất bại");
    } finally {
      setAutoBidLoading(false);
    }
  };

  const isAutoBidValid = autoBidMaxPrice && Number(autoBidMaxPrice) >= minBidPrice;

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
            <div className="text-[30px] font-extrabold mb-4">{productDetail.name}</div>
            
            {/* Auction Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              {isAuctionActive && !isAuctionEnded ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  Đang đấu giá
                </Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1">
                  Đã kết thúc
                </Badge>
              )}
              
              {/* Countdown Timer */}
              {productDetail.end_date_time && !isAuctionEnded && (
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Còn lại: {timeRemaining}</span>
                </div>
              )}
            </div>

            {isSellerDeleted ? (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Người bán đã bị xóa</span>
              </div>
            ) : (
              <>
                <div className="text-[20px]">Người bán: <span className="font-extrabold">{productDetail.seller}</span></div>
                <div className="text-[20px]">Liên hệ: <span className="font-extrabold">{productDetail.seller_email}</span></div>
              </>
            )}
            
            {/* Price Grid */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="text-[14px] font-bold">
                <span>Giá khởi điểm:</span> 
                <span className="text-[var(--main-client-color)] text-[16px] ml-1">{parseInt(productDetail.starting_price).toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="text-[14px] font-bold">
                <span>Giá hiện tại:</span> 
                <span className="text-[var(--main-client-color)] text-[20px] font-extrabold ml-1">{currentPrice.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="text-[14px] font-bold">
                <span>Giá mua ngay:</span> 
                <span className="text-[var(--main-client-color)] text-[16px] ml-1">{parseInt(productDetail.immediate_purchase_price).toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="text-[14px] font-bold">
                <span>Bước giá:</span> 
                <span className="text-[var(--main-client-color)] text-[16px] ml-1">{pricingStep.toLocaleString("vi-VN")} VND</span>
              </div>
            </div>

            <div className="text-[15px] mt-[30px] font-bold">Thời điểm đăng: <span className="font-light">{dateTimeFormat(productDetail.posted_date_time)}</span></div>
            <div className="text-[15px] font-bold">Phiên đấu giá kết thúc tại: <span className="font-light">{productDetail.end_date_time ? dateTimeFormat(productDetail.end_date_time) : "-"}</span></div>
            
            {/* Anti-sniping notice */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Đấu giá sẽ được gia hạn nếu có bid trong phút cuối</span>
            </div>

            {/* Auto-bid Status Section */}
            {isLogin && currentAutoBid && !isOwnProduct && (
              <div className={`mt-4 p-4 rounded-lg border-2 ${autoBidExceeded ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-5 h-5 ${autoBidExceeded ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className={`font-bold ${autoBidExceeded ? 'text-red-700' : 'text-blue-700'}`}>
                      {autoBidExceeded ? 'Auto-Bid đã đạt mức tối đa' : 'Auto-Bid đang bật'}
                    </span>
                  </div>
                  {!autoBidExceeded && (
                    <Badge className="bg-green-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Đang hoạt động
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Giá tối đa của bạn: </span>
                  <span className="font-bold text-lg">{parseInt(currentAutoBid.max_bid).toLocaleString("vi-VN")} VND</span>
                </div>
                
                {autoBidExceeded && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Bạn không còn là người dẫn đầu. Hãy tăng giá tối đa!</span>
                  </div>
                )}
                
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleOpenAutoBidModal}
                    disabled={autoBidLoading || isAuctionEnded}
                  >
                    <Settings2 className="w-4 h-4 mr-1" />
                    Cập nhật giá tối đa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleCancelAutoBid}
                    disabled={autoBidLoading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Hủy auto-bid
                  </Button>
                </div>
              </div>
            )}

            {/* Bidding Section - only show if not own product and auction active */}
            {isLogin && !isOwnProduct && isAuctionActive && !isAuctionEnded && (
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

                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Nhập số tiền đấu giá"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      disabled={!isLogin || bidLoading}
                      min={minBidPrice}
                      className="flex-1"
                    />
                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={handlePlaceBidClick}
                        disabled={!isLogin || bidLoading}
                        className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/90 text-white"
                      >
                        {bidLoading ? "Đang gửi..." : "Đặt giá ngay"}
                      </Button>
                      
                      {/* Auto-bid button */}
                      {!currentAutoBid && (
                        <Button
                          onClick={handleOpenAutoBidModal}
                          variant="outline"
                          className="border-[var(--main-client-color)] text-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/10"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Auto-Bid
                        </Button>
                      )}
                      
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

            {/* Auction ended message */}
            {isAuctionEnded && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-lg font-semibold text-gray-700">Phiên đấu giá đã kết thúc</p>
                <p className="text-sm text-gray-500 mt-1">Giá cuối cùng: {currentPrice.toLocaleString("vi-VN")} VND</p>
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

          {/* Auto-bid Modal */}
          <Dialog open={showAutoBidModal} onOpenChange={setShowAutoBidModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[var(--main-client-color)]" />
                  {currentAutoBid ? "Cập nhật Auto-Bid" : "Đặt giá tự động (Auto-Bid)"}
                </DialogTitle>
                <DialogDescription>
                  Hệ thống sẽ tự động đặt giá thay bạn để giữ vị trí dẫn đầu
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Explanation */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-700">Hệ thống sẽ tự động đặt giá thay bạn</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-700">Giá chỉ tăng khi có người khác đặt giá</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-700">Bạn sẽ không bao giờ trả vượt quá giá tối đa</p>
                  </div>
                </div>

                {/* Min price notice */}
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Giá tối thiểu: <span className="font-bold text-[var(--main-client-color)]">{minBidPrice.toLocaleString("vi-VN")} VND</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Giá hiện tại {currentPrice.toLocaleString("vi-VN")} + Bước giá {pricingStep.toLocaleString("vi-VN")})
                  </p>
                </div>

                {/* Max bid input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá tối đa bạn sẵn sàng trả (VND)</label>
                  <Input
                    type="number"
                    placeholder="Nhập giá tối đa"
                    value={autoBidMaxPrice}
                    onChange={(e) => setAutoBidMaxPrice(e.target.value)}
                    min={minBidPrice}
                    className="text-lg"
                  />
                  {autoBidMaxPrice && Number(autoBidMaxPrice) < minBidPrice && (
                    <p className="text-red-500 text-sm">
                      Giá phải lớn hơn hoặc bằng {minBidPrice.toLocaleString("vi-VN")} VND
                    </p>
                  )}
                </div>

                {/* Current auto-bid info */}
                {currentAutoBid && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Giá auto-bid hiện tại của bạn: <span className="font-bold">{parseInt(currentAutoBid.max_bid).toLocaleString("vi-VN")} VND</span>
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowAutoBidModal(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmAutoBid}
                  disabled={!isAutoBidValid || autoBidLoading}
                  className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-color)]/90"
                >
                  {autoBidLoading ? "Đang xử lý..." : "Xác nhận Auto-Bid"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}