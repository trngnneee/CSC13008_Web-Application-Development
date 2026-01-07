import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleAlertIcon } from "lucide-react"
import { clientAddToWishlist, clientRemoveFromWishlist } from "@/lib/clientAPI/user";
import { toast } from "sonner";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const WishListButton = ({ onClickSuccess, id, showTitle = false }) => {
  const { userInfo } = useClientAuthContext();
  const [userInfoState, setUserInfoState] = useState(userInfo);

  const handleAddToWishlist = () => {
    const promise = clientAddToWishlist({ id_product: id });
    toast.promise(promise, {
      loading: "Đang thêm vào danh sách yêu thích...",
      success: (data) => {
        if (data.code == "success") {
          setUserInfoState(prevState => ({
            ...prevState,
            watchList: [...prevState.watchList, id]
          }));
          return data.message;
        }
        else return Promise.reject(data.message);
      },
      error: (err) => err?.toString() || "Thêm vào danh sách yêu thích thất bại",
    })
  }

  const handleRemoveFromWishlist = () => {
    const promise = clientRemoveFromWishlist({ id_product: id });
    toast.promise(promise, {
      loading: "Đang xóa khỏi danh sách yêu thích...",
      success: (data) => {
        if (data.code == "success") {
          setUserInfoState(prevState => ({
            ...prevState,
            watchList: prevState.watchList.filter(item => item !== id)
          }));
          return data.message;
        }
        else return Promise.reject(data.message);
      },
      error: (err) => err?.toString() || "Xóa khỏi danh sách yêu thích thất bại",
    })
  }

  useEffect(() => {
  }, [userInfoState])

  return (
    userInfoState && userInfoState.watchList.length > 0 && userInfoState.watchList.includes(id) ? (
      <AlertDialog>
        <AlertDialogTrigger asChild onClick={(e) => {
          e.stopPropagation();
          // e.preventDefault();
        }}>
          <Button
            className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // e.preventDefault();
            }}
          >
            <Heart fill="var(--main-client-color)" />
            <span className={cn(
              showTitle ? "block" : "hidden"
            )}>Xóa khỏi danh sách yêu thích</span>
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center border">
              <CircleAlertIcon className="opacity-80" size={16} />
            </div>

            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa khỏi danh sách yêu thích?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xóa sản phẩm khỏi danh sách yêu thích của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              Hủy
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"
              onClick={(e) => {
                e.stopPropagation();
                // e.preventDefault();
                onClickSuccess?.(e);
                handleRemoveFromWishlist();
              }}
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
            className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart />
            <span className={cn(
              showTitle ? "block" : "hidden"
            )}>Thêm vào danh sách yêu thích</span>
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border">
              <CircleAlertIcon className="opacity-80" size={16} />
            </div>

            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thêm vào danh sách yêu thích?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ lưu sản phẩm vào danh sách yêu thích của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => e.stopPropagation()}
            >
              Hủy
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]"
              onClick={(e) => {
                e.stopPropagation();
                onClickSuccess?.(e);
                handleAddToWishlist();
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};