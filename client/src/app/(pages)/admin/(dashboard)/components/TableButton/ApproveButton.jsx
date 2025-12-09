import { Button } from "@/components/ui/button"
import { Check, CircleAlertIcon } from "lucide-react"
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export const AdminApproveButton = ({ api }) => {
  const handleApprove = async () => {
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
          <Button className="bg-[var(--main-color)] hover:bg-[var(--main-hover)]">
            <Check />
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
              <AlertDialogTitle>Bạn có chắc chắn muốn duyệt yêu cầu này không?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ cấp quyền người bán cho người dùng.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"} onClick={handleApprove}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}