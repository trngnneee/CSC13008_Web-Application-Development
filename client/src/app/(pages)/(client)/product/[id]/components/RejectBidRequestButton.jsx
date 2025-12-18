import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export const RejectBidRequestButton = () => {
  return (
    <Button variant={"destructive"}>
      <X />
    </Button>
  )
}