import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"

export const CategoryFilter = () => {
  return (
    <>
      <Label htmlFor="category-filter" className="text-[20px] font-regular mr-5">Lọc phiên đấu giá theo:</Label>
      <SelectNative id="category-filter" className="w-[200px]">
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
        <option>Option 4</option>
      </SelectNative>
    </>
  )
}