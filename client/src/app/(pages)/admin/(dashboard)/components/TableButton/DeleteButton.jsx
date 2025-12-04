import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import { CircleAlertIcon, Trash } from "lucide-react"
import { toast } from "sonner";

export const AdminDeleteButton = ({ api }) => {
  const handleDelete = async () => {
    const promise = fetch(api, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    toast.promise(promise, {
      loading: "Đang xóa...",
      success: (data) => {
        if (data.code == "success") {
          window.location.reload();
          return data.message;
        }
      },
      error: "Đã xảy ra lỗi khi xóa.",
    })
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash className="" size={16} aria-hidden="true" />
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
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"} onClick={handleDelete}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}