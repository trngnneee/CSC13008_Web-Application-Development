import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

export const AdminDeleteButton = () => {
  return (
    <>
      <Button variant="destructive">
        <Trash className="" size={16} aria-hidden="true" />
      </Button>
    </>
  )
}