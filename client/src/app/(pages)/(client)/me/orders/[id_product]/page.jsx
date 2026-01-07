"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderByProduct, submitPayment, confirmPayment, confirmReceived, rateOrder, cancelOrder, getRatingStatus } from "@/lib/clientAPI/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Star, Truck, CreditCard, Package, ThumbsUp, ThumbsDown, Upload, Image } from "lucide-react";

const statusLabels = {
  pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-500", step: 1 },
  pending_shipping: { label: "Chờ giao hàng", color: "bg-blue-500", step: 2 },
  pending_delivery: { label: "Đang giao", color: "bg-purple-500", step: 3 },
  pending_rating: { label: "Chờ đánh giá", color: "bg-orange-500", step: 4 },
  completed: { label: "Hoàn thành", color: "bg-green-500", step: 5 },
  cancelled: { label: "Đã hủy", color: "bg-red-500", step: 0 },
};

export default function OrderDetailPage() {
  const { id_product } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingStatus, setRatingStatus] = useState(null);
  const [formData, setFormData] = useState({
    payment_bill: null, // File object
    payment_bill_preview: "", // Preview URL
    address: "",
    b_l: null, // File object
    b_l_preview: "", // Preview URL
    rating: 0,
    comment: "",
  });

  const fetchOrder = async () => {
    const response = await getOrderByProduct(id_product);
    if (response.code === "success") {
      setOrder(response.data);
      // Fetch rating status if order is in rating phase
      if (["pending_rating", "completed"].includes(response.data.status)) {
        const ratingRes = await getRatingStatus(response.data.id_order);
        if (ratingRes.code === "success") {
          setRatingStatus(ratingRes.data);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id_product]);

  const handleSubmitPayment = async () => {
    if (!formData.payment_bill || !formData.address) {
      alert("Vui lòng tải ảnh hóa đơn và nhập địa chỉ giao hàng");
      return;
    }
    const response = await submitPayment(order.id_order, formData.payment_bill, formData.address);
    if (response.code === "success") {
      fetchOrder();
    } else {
      alert(response.message);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        [field]: file,
        [`${field}_preview`]: previewUrl,
      });
    }
  };

  const handleConfirmPayment = async () => {
    const response = await confirmPayment(order.id_order, formData.b_l);
    if (response.code === "success") {
      fetchOrder();
    } else {
      alert(response.message);
    }
  };

  const handleConfirmReceived = async () => {
    const response = await confirmReceived(order.id_order);
    if (response.code === "success") {
      fetchOrder();
    } else {
      alert(response.message);
    }
  };

  const handleRate = async (rating) => {
    const response = await rateOrder(order.id_order, rating, formData.comment);
    if (response.code === "success") {
      fetchOrder();
    } else {
      alert(response.message);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này? Người mua sẽ bị trừ điểm đánh giá.")) {
      return;
    }
    const response = await cancelOrder(order.id_order);
    if (response.code === "success") {
      fetchOrder();
    } else {
      alert(response.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Đang tải...</div>;
  }

  if (!order) {
    return <div className="container mx-auto py-10 text-center text-red-500">Không tìm thấy đơn hàng</div>;
  }

  const currentStep = statusLabels[order.status]?.step || 0;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Chi tiết đơn hàng</h1>

      {/* Product Info */}
      <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
        <div className="flex gap-6">
          <img
            src={order.product_avatar || "/placeholder.png"}
            alt={order.product_name}
            className="w-32 h-32 object-cover rounded"
          />
          <div className="flex-1">
            <h2 className="font-semibold text-xl">{order.product_name}</h2>
            <p className="text-gray-600 mt-1">
              {order.isWinner ? `Người bán: ${order.seller_name}` : `Người mua: ${order.winner_name}`}
            </p>
            <p className="text-[var(--main-color)] font-bold text-2xl mt-2">
              {parseInt(order.final_price).toLocaleString("vi-VN")} VND
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={statusLabels[order.status]?.color || "bg-gray-500"}>
                {statusLabels[order.status]?.label || order.status}
              </Badge>
              {order.isSeller && order.status !== "completed" && order.status !== "cancelled" && (
                <Button variant="destructive" size="sm" onClick={handleCancel}>
                  Hủy đơn
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {order.status !== "cancelled" && (
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Tiến trình đơn hàng</h3>
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-[var(--main-color)] -z-10 transition-all"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            ></div>
            
            {[
              { step: 1, label: "Thanh toán", icon: CreditCard },
              { step: 2, label: "Giao hàng", icon: Truck },
              { step: 3, label: "Nhận hàng", icon: Package },
              { step: 4, label: "Đánh giá", icon: Star },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? "bg-[var(--main-color)] text-white" : "bg-gray-200"
                }`}>
                  {currentStep > step ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className="text-sm mt-2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        {/* Step 1: Winner submits payment */}
        {order.status === "pending_payment" && order.isWinner && (
          <div>
            <h3 className="font-semibold mb-4">Bước 1: Thanh toán</h3>
            <div className="space-y-4">
              <div>
                <Label>Ảnh hóa đơn chuyển tiền <span className="text-red-500">*</span></Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.payment_bill_preview ? (
                        <img src={formData.payment_bill_preview} alt="Preview" className="h-20 object-contain" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Click để tải ảnh hóa đơn</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "payment_bill")}
                    />
                  </label>
                  {formData.payment_bill && (
                    <p className="text-sm text-green-600 mt-1">✓ Đã chọn: {formData.payment_bill.name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Địa chỉ giao hàng <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Nhập địa chỉ giao hàng..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <Button onClick={handleSubmitPayment} className="bg-[var(--main-color)]">
                Gửi thông tin thanh toán
              </Button>
            </div>
          </div>
        )}

        {order.status === "pending_payment" && order.isSeller && (
          <div className="text-center text-gray-500">
            Đang chờ người mua thanh toán...
          </div>
        )}

        {/* Step 2: Seller confirms and ships */}
        {order.status === "pending_shipping" && order.isSeller && (
          <div>
            <h3 className="font-semibold mb-4">Bước 2: Xác nhận thanh toán & Gửi hàng</h3>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="mb-2">
                <strong>Hóa đơn thanh toán:</strong>
                <a href={order.payment_bill} target="_blank" className="ml-2 text-blue-500 underline">Xem ảnh hóa đơn</a>
              </div>
              {order.payment_bill && (
                <img src={order.payment_bill} alt="Hóa đơn" className="max-w-xs rounded border mb-2" />
              )}
              <p><strong>Địa chỉ giao hàng:</strong> {order.address}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Ảnh vận đơn (B/L) - không bắt buộc</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.b_l_preview ? (
                        <img src={formData.b_l_preview} alt="Preview" className="h-20 object-contain" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Click để tải ảnh vận đơn</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "b_l")}
                    />
                  </label>
                  {formData.b_l && (
                    <p className="text-sm text-green-600 mt-1">✓ Đã chọn: {formData.b_l.name}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleConfirmPayment} className="bg-[var(--main-color)]">
                Xác nhận đã gửi hàng
              </Button>
            </div>
          </div>
        )}

        {order.status === "pending_shipping" && order.isWinner && (
          <div className="text-center text-gray-500">
            Đang chờ người bán xác nhận và gửi hàng...
          </div>
        )}

        {/* Step 3: Winner confirms received */}
        {order.status === "pending_delivery" && order.isWinner && (
          <div>
            <h3 className="font-semibold mb-4">Bước 3: Xác nhận nhận hàng</h3>
            {order.b_l && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="mb-2"><strong>Ảnh vận đơn:</strong></p>
                <img src={order.b_l} alt="Vận đơn" className="max-w-xs rounded border" />
              </div>
            )}
            <Button onClick={handleConfirmReceived} className="bg-[var(--main-color)]">
              Xác nhận đã nhận hàng
            </Button>
          </div>
        )}

        {order.status === "pending_delivery" && order.isSeller && (
          <div>
            <h3 className="font-semibold mb-4 text-center">Đang chờ người mua xác nhận nhận hàng...</h3>
            {order.b_l && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="mb-2"><strong>Ảnh vận đơn đã gửi:</strong></p>
                <img src={order.b_l} alt="Vận đơn" className="max-w-xs rounded border" />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Rating */}
        {order.status === "pending_rating" && (
          <div>
            <h3 className="font-semibold mb-4">Bước 4: Đánh giá {order.isWinner ? "người bán" : "người mua"}</h3>
            
            {/* Show rating form if user hasn't rated yet */}
            {ratingStatus && !ratingStatus.hasRated && (
              <div className="space-y-4">
                <div>
                  <Label>Nhận xét (không bắt buộc)</Label>
                  <Input
                    placeholder="Nhập nhận xét..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleRate(1)} 
                    className="bg-green-500 hover:bg-green-600 flex-1"
                  >
                    <ThumbsUp className="mr-2" /> Tích cực (+1)
                  </Button>
                  <Button 
                    onClick={() => handleRate(-1)} 
                    variant="destructive"
                    className="flex-1"
                  >
                    <ThumbsDown className="mr-2" /> Tiêu cực (-1)
                  </Button>
                </div>
              </div>
            )}

            {/* Show waiting message if user has rated but other party hasn't */}
            {ratingStatus && ratingStatus.hasRated && !ratingStatus.bothRated && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Bạn đã đánh giá thành công!</p>
                <p className="text-gray-500 mt-2">
                  Đang chờ {order.isWinner ? "người bán" : "người mua"} đánh giá...
                </p>
              </div>
            )}

            {/* Show if not loaded rating status yet */}
            {!ratingStatus && (
              <div className="space-y-4">
                <div>
                  <Label>Nhận xét (không bắt buộc)</Label>
                  <Input
                    placeholder="Nhập nhận xét..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleRate(1)} 
                    className="bg-green-500 hover:bg-green-600 flex-1"
                  >
                    <ThumbsUp className="mr-2" /> Tích cực (+1)
                  </Button>
                  <Button 
                    onClick={() => handleRate(-1)} 
                    variant="destructive"
                    className="flex-1"
                  >
                    <ThumbsDown className="mr-2" /> Tiêu cực (-1)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed */}
        {order.status === "completed" && (
          <div className="text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-xl text-green-600">Đơn hàng đã hoàn thành!</h3>
            <p className="text-gray-500 mt-2">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
          </div>
        )}

        {/* Cancelled */}
        {order.status === "cancelled" && (
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-xl text-red-600">Đơn hàng đã bị hủy</h3>
          </div>
        )}
      </div>
    </div>
  );
}
