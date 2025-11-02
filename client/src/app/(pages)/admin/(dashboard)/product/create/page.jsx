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
import TextEditor from "../../components/TinyMCE";

export default function AdminProductCreate() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageList, setImageList] = useState([]);
  const [price, setPrice] = useState(0);
  const [instantPrice, setInstantPrice] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [priceStep, setPriceStep] = useState(0);
  const [desc, setDesc] = useState("");

  return (
    <>
      <DashboardTitle title="Tạo sản phẩm" />
      <form action="/form" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
        <div className="flex gap-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-[#606060]"
            >
              Tên sản phẩm
            </Label>
            <Input
              placeholder="Sản phẩm 1..."
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
              Danh mục
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
          <Label
            htmlFor="image"
            className="text-sm font-semibold text-[#606060]"
          >
            Hình ảnh sản phẩm
          </Label>
          <ImageUploader
            value={imageList}
            onChange={setImageList}
            maxFiles={1}
            id="image"
            name="image"
          />
        </div>
        <div className="flex gap-5 mt-[30px]">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="price"
              className="text-sm font-semibold text-[#606060]"
            >
              Giá sản phẩm
            </Label>
            <Input
              id="price"
              name="price"
              placeholder="100000"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="startingPrice"
              className="text-sm font-semibold text-[#606060]"
            >
              Giá khởi điểm
            </Label>
            <Input
              id="startingPrice"
              name="startingPrice"
              placeholder="100000"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="instantPrice"
              className="text-sm font-semibold text-[#606060]"
            >
              Giá mua ngay
            </Label>
            <Input
              id="instantPrice"
              name="instantPrice"
              placeholder="100000"
              type="number"
              value={instantPrice}
              onChange={(e) => setInstantPrice(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="priceStep"
              className="text-sm font-semibold text-[#606060]"
            >
              Bước nhảy
            </Label>
            <Input
              id="priceStep"
              name="priceStep"
              placeholder="100000"
              type="number"
              value={priceStep}
              onChange={(e) => setPriceStep(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-[30px] flex flex-col gap-3">
          <Label
            htmlFor="desc"
            className="text-sm font-semibold text-[#606060]"
          >
            Mô tả sản phẩm
          </Label>
          <TextEditor
            content={desc}
            setContent={setDesc}
          />
        </div>

        <div className="flex flex-col items-center mt-[30px]">
          <Button className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Tạo sản phẩm</Button>
          <Link href="/admin/product" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}