"use client"

import { Label } from "@/components/ui/label";
import { DashboardTitle } from "../../components/DashboardTitle";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "../../components/ImageUploader";
import { useState } from "react";
import Link from "next/link";

export default function AdminCategoryCreate() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageList, setImageList] = useState([]);
  
  return (
    <>
      <DashboardTitle title="Tạo danh mục" />
      <form action="/form" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
        <div className="flex gap-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-[#606060]"
            >
              Tên danh mục
            </Label>
            <Input 
              placeholder="Danh mục 1..." 
              id="name" 
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="category"
              className="text-sm font-semibold text-[#606060]"
            >
              Danh mục cha
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="category">
                <Button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{category || "Chọn danh mục"}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategory("")}>Chọn danh mục</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory("Danh mục 1")}>Danh mục 1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory("Danh mục 2")}>Danh mục 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory("Danh mục 3")}>Danh mục 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-[30px]">
          <ImageUploader
            value={imageList}
            onChange={setImageList}
            maxFiles={1}
          />
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Tạo danh mục</Button>
          <Link href="/admin/category" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}