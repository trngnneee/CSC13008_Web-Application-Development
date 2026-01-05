import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import { CircleAlertIcon, KeyRound } from "lucide-react"
import { toast } from "sonner";

export const AdminResetPasswordButton = ({ api }) => {
  const handleResetPassword = async () => {
    const promise = fetch(api, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    toast.promise(promise, {
      loading: "Đang đặt lại mật khẩu...",
      success: (data) => {
        if (data.code == "success") {
          return data.message;
        }
        throw new Error(data.message);
      },
      error: (err) => err.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.",
    })
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="bg-amber-500 hover:bg-amber-600 text-white hover:text-white">
            <KeyRound className="" size={16} aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <CircleAlertIcon className="opacity-80" size={16} />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn đặt lại mật khẩu?</AlertDialogTitle>
              <AlertDialogDescription>
                Mật khẩu mới sẽ được gửi đến email của người dùng.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"} onClick={handleResetPassword}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
