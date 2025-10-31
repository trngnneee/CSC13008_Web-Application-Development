import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

export const DashboardMultipleApply = () => {
  return (
    <>
      <div className="bg-white rounded-[14px] border-[0.6px] border-[#D5D5D5] text-sm font-medium overflow-hidden flex items-center justify-between w-[300px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="flex justify-center w-full items-center">
            <Button className="flex justify-center items-center gap-2 p-4 bg-white hover:bg-white rounded-none shadow-none cursor-pointer">
              <div className="text-black">-- Hành động --</div>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Hoạt động</DropdownMenuItem>
            <DropdownMenuItem>Tạm dừng</DropdownMenuItem>
            <DropdownMenuItem>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="w-1/2 bg-white hover:bg-white text-red-400 shadow-none rounded-none border-l border-[#D5D5D5] cursor-pointer">Áp dụng</Button>
      </div>
    </>
  )
}