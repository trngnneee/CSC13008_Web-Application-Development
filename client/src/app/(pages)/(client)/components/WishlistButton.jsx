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

export const WishListButton = ({ onClickSuccess, id }) => {
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
        <AlertDialogTrigger asChild>
          <Button
            className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] rounded-full text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] w-10 h-10 flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart fill="var(--main-client-color)" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border">
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
              onClick={(e) => e.stopPropagation()}
            >
              Hủy
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]"
              onClick={(e) => {
                e.stopPropagation();
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
            className="bg-white hover:bg-gray-100 shadow-none border border-[var(--main-client-color)] rounded-full text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] w-10 h-10 flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart />
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
              className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]"
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