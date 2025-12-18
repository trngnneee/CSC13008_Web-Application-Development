import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export const ApproveBidRequestButton = () => {
  return (
    <>
      <Button className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"}>
        <Check />
      </Button>
    </>
  )
}