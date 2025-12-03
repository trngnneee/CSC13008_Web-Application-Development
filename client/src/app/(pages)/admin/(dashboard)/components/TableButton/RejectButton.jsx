import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export const AdminRejectButton = () => {
  return (
    <>
      <Button variant={"destructive"}>
        <X />
      </Button>
    </>
  )
}