"use client"

import { useEffect, useState } from "react";
import { getBidRequests, approveBidRequest, rejectBidRequest } from "@/lib/clientAPI/bid";
import { toastHandler } from "@/lib/toastHandler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, Package } from "lucide-react";
import { dateTimeFormat } from "@/utils/date";
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

export default function BidRequestsPage() {
  const [bidRequests, setBidRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null });

  const fetchBidRequests = async () => {
    try {
      setLoading(true);
      const result = await getBidRequests();
      setBidRequests(result.data);
    } catch (error) {
      toastHandler(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidRequests();
  }, []);

  const handleApprove = async (id_request) => {
    setConfirmDialog({ open: false, type: null, id: null });
    setActionLoading(id_request);
    try {
      await approveBidRequest(id_request);
      toastHandler("Đã phê duyệt yêu cầu đấu giá", "success");
      fetchBidRequests();
    } catch (error) {
      toastHandler(error.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id_request) => {
    setConfirmDialog({ open: false, type: null, id: null });
    setActionLoading(id_request);
    try {
      await rejectBidRequest(id_request);
      toastHandler("Đã từ chối yêu cầu đấu giá", "success");
      fetchBidRequests();
    } catch (error) {
      toastHandler(error.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Chờ duyệt</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Đã duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Đã từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <div className="w-full overflow-hidden relative h-[100px]">
        <img src="/shape3.svg" className="w-full h-full object-cover" />
        <div className="text-white text-[50px] font-extrabold absolute bottom-1/2 translate-y-1/2 left-0 translate-x-1/5">
          Yêu cầu đấu giá
        </div>
      </div>

      <div className="container mx-auto my-[50px]">
        <div className="text-[30px] font-extrabold mb-[30px]">
          Danh sách yêu cầu đấu giá từ người mua
        </div>

        {loading ? (
          <div className="text-center py-10">Đang tải...</div>
        ) : bidRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Chưa có yêu cầu đấu giá nào
          </div>
        ) : (
          <div className="space-y-4">
            {bidRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
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
                      {getStatusBadge(request.status)}
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

                  {/* Actions */}
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        disabled={actionLoading === request.id}
                        onClick={() => setConfirmDialog({ open: true, type: "approve", id: request.id })}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === request.id}
                        onClick={() => setConfirmDialog({ open: true, type: "reject", id: request.id })}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "approve" ? "Xác nhận phê duyệt?" : "Xác nhận từ chối?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "approve"
                ? "Sau khi phê duyệt, người mua sẽ có thể đấu giá sản phẩm của bạn."
                : "Sau khi từ chối, người mua sẽ không thể đấu giá sản phẩm này."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className={confirmDialog.type === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
              onClick={() => {
                if (confirmDialog.type === "approve") {
                  handleApprove(confirmDialog.id);
                } else {
                  handleReject(confirmDialog.id);
                }
              }}
            >
              {confirmDialog.type === "approve" ? "Phê duyệt" : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
