import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CircleAlertIcon } from "lucide-react"

export const AdminRejectButton = ({ api }) => {
  const handleReject = async () => {
    const promise = await fetch(api, {
      method: "PUT",
      credentials: "include"
    });
    const data = await promise.json();
    if (data.code === "success") {
      toast.success("Đã duyệt yêu cầu nâng cấp thành công!");
      window.location.reload();
    }
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={"destructive"}>
            <X />
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
              <AlertDialogTitle>Bạn có chắc chắn muốn từ chối yêu cầu này không?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ từ chối quyền người bán cho người dùng.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"} onClick={handleReject}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}