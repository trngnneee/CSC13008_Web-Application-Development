"use client"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HeaderTitle } from "../../components/HeaderTitle";
import TextEditor from "@/app/(pages)/admin/(dashboard)/components/TinyMCE";
import { ImageUploader } from "@/app/(pages)/admin/(dashboard)/components/ImageUploader";
import { Checkbox } from "@/components/ui/checkbox";
import JustValidate from "just-validate";
import { toast } from "sonner";
import { clientCategoryList } from "@/lib/clientAPI/category";
import { buildCategoryTree, renderCategoryTree } from "@/helper/category";
import { clientProductCreate } from "@/lib/clientAPI/product";
import { toastHandler } from "@/lib/toastHandler";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "date-fns";

export default function SellerProductCreatePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageList, setImageList] = useState([]);
  const [price, setPrice] = useState(0);
  const [instantPrice, setInstantPrice] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [priceStep, setPriceStep] = useState(0);
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  // const [autoRenew, setAutoRenew] = useState(false);
  const [submit, setSubmit] = useState(false);
  const router = useRouter();

  const [categoryList, setCategoryList] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientCategoryList();
      if (promise.code == "success") {
        setCategoryList(promise.data);
        setCategoryTree(buildCategoryTree(promise.data));
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    const validation = new JustValidate("#productCreateForm");

    validation
      .addField("#name", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập tên sản phẩm!",
        },
        {
          rule: "minLength",
          value: 2,
          errorMessage: "Tên sản phẩm phải có ít nhất 2 ký tự!",
        },
      ])
      .addField("#category", [
        {
          rule: "required",
          errorMessage: "Vui lòng chọn danh mục sản phẩm!",
        },
      ])
      .addField("#startingPrice", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập giá khởi điểm!",
        },
        {
          rule: "number",
          errorMessage: "Giá khởi điểm phải là số!",
        },
      ])
      .addField("#instantPrice", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập giá mua ngay!",
        },
        {
          rule: "number",
          errorMessage: "Giá mua ngay phải là số!",
        },
      ])
      .addField("#priceStep", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập bước giá!",
        },
        {
          rule: "number",
          errorMessage: "Bước giá phải là số!",
        },
      ])
      .onSuccess(() => {
        setSubmit(true);
      });
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submit) {
      if (imageList.length < 3) {
        toast.error("Vui lòng tải lên ít nhất 3 hình ảnh sản phẩm!");
        setSubmit(false);
        return;
      }
      const formData = new FormData();
      formData.append("id_category", category);
      imageList.forEach(file => {
        formData.append("files", file);
      });
      formData.append("name", name);
      formData.append("price", price);
      formData.append("immediate_purchase_price", instantPrice);
      formData.append("description", desc);
      formData.append("pricing_step", priceStep);
      formData.append("starting_price", startingPrice);
      formData.append("auto_renew", e.target.autoRenew.checked);
      formData.append("end_date_time", date ? date.toISOString() : "");

      const promise = clientProductCreate(formData);
      toastHandler(promise, router, "/me/product");
    }
  }

  return (
    <>
      <HeaderTitle title="Tạo sản phẩm mới" />
      <form id="productCreateForm" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]" onSubmit={handleSubmit}>
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
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{categoryList.find((item) => item.id === category)?.name || "Chọn danh mục"}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categoryList.length > 0 && renderCategoryTree(categoryTree, 0, setCategory)}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input id="category" type={"hidden"} value={category} onChange={() => { }} />
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
            maxFiles={5}
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
              Giá
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
        <div className="mt-5">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="endDate"
              className="text-sm font-semibold text-[#606060]"
            >
              Ngày kết thúc đấu giá
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Input
                  type="text"
                  id="endDate"
                  name="endDate"
                  value={formatDate(date, "dd/MM/yyyy")}
                  readOnly
                  className="cursor-pointer"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full flex items-center gap-3 mt-5">
            <Label
              htmlFor="autoRenew"
              className="text-sm font-semibold text-[#606060]"
            >
              Tự động gia hạn
            </Label>
            <Checkbox id="autoRenew" name="autoRenew" className="data-[state=checked]:bg-[var(--main-client-color)]" />
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
          <Button disabled={submit} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] w-full font-bold text-lg">Tạo sản phẩm</Button>
          <Link href="/me/product" className="text-[var(--main-client-color)] hover:text-[var(--main-client-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}