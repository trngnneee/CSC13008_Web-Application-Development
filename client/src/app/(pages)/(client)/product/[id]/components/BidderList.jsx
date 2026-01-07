"use client"

import { useEffect, useState } from "react";
import { getBidderListByProduct, kickBidderFromProduct, recoverBidderFromProduct } from "@/lib/clientAPI/bid";
import { useParams } from "next/navigation";
import { Ban, CircleAlertIcon, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const BidderList = () => {
  const { id } = useParams();
  const [bidderList, setBidderList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBidRequests = async () => {
    setLoading(true);
    const response = await getBidderListByProduct(id);
    if (response.code === "success") {
      setBidderList(response.data);
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

  if (bidderList.length === 0) {
    return <div className="text-center py-4 text-gray-500">Không có người đấu giá nào</div>;
  }

  const handleKickBidder = (id_bidder) => () => {
    const promise = kickBidderFromProduct(id, id_bidder);
    toast.promise(promise, {
      loading: "Đang kick người đấu giá...",
      success: "Đã kick người đấu giá khỏi sản phẩm đấu giá",
      error: "Kick người đấu giá thất bại",
    });
    setBidderList((prev) => prev.map((bidder) => bidder.id_user === id_bidder ? { ...bidder, is_banned: true } : bidder));
  }

  const handleRecovery = async (id_bidder) => {
    const promise = recoverBidderFromProduct(id, id_bidder);
    toast.promise(promise, {
      loading: "Đang phục hồi người đấu giá...",
      success: "Đã phục hồi người đấu giá cho sản phẩm đấu giá",
      error: "Phục hồi người đấu giá thất bại",
    });
    setBidderList((prev) => prev.map((bidder) => bidder.id_user === id_bidder ? { ...bidder, is_banned: false } : bidder));
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Người đấu giá</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bidderList.map((bidder) => (
              <tr
                key={bidder.id_user}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{bidder.bidder_name}</td>
                <td className="px-4 py-3 text-gray-600">{bidder.bidder_email}</td>
                <td className="px-4 py-3">
                  {bidder.is_banned ? (
                    <Badge >Đã bị kick</Badge>
                  ) : (
                    <Badge>Đang tham gia</Badge>
                  )}
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  {!bidder.is_banned ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          // className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] flex items-center justify-center cursor-pointer"
                          variant={"destructive"}
                        >
                          <Ban />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                          <div className="flex size-9 shrink-0 items-center justify-center border">
                            <CircleAlertIcon className="opacity-80" size={16} />
                          </div>

                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận kick người đấu giá</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này sẽ loại bỏ người đấu giá khỏi sản phẩm đấu giá của bạn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Hủy
                          </AlertDialogCancel>

                          <AlertDialogAction
                            className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"
                            onClick={handleKickBidder(bidder.id_user)}
                          >
                            Xác nhận
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className={"bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"}
                        >
                          <RotateCcw />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                          <div className="flex size-9 shrink-0 items-center justify-center border">
                            <CircleAlertIcon className="opacity-80" size={16} />
                          </div>

                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận kick người đấu giá</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này sẽ loại bỏ người đấu giá khỏi sản phẩm đấu giá của bạn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Hủy
                          </AlertDialogCancel>

                          <AlertDialogAction
                            className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"
                            onClick={() => handleRecovery(bidder.id_user)}
                          >
                            Xác nhận
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}