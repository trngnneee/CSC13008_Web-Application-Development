import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export const SearchBar = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] rounded-full px-3 py-3">
            <Search strokeWidth={2} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <Label className="text-black -mt-2">Nhập từ khóa</Label>
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
          />
        </DialogContent>
      </Dialog>
    </>
  )
}