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
import TextEditor from "../../components/TinyMCE";
import { ImageUploader } from "../../components/ImageUploader";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getCategoryList } from "@/lib/adminAPI/category";
import { buildCategoryTree, renderCategoryTree } from "@/helper/category";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "date-fns";

export default function AdminProductCreatePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryName, setCategoryName] = useState("Chọn danh mục");
  const [imageList, setImageList] = useState([]);
  const [price, setPrice] = useState(0);
  const [instantPrice, setInstantPrice] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [priceStep, setPriceStep] = useState(0);
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  const [submit, setSubmit] = useState(false);
  const router = useRouter();

  const [categoryList, setCategoryList] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promise = await getCategoryList();
        if (promise.code == "success") {
          setCategoryList(promise.data);
          setCategoryTree(buildCategoryTree(promise.data));
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh mục!");
      }
    }
    fetchData();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || name.length < 2) {
      toast.error("Vui lòng nhập tên sản phẩm (tối thiểu 2 ký tự)!");
      return;
    }
    if (!category) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }
    if (imageList.length < 3) {
      toast.error("Vui lòng tải lên ít nhất 3 hình ảnh sản phẩm!");
      return;
    }
    if (!startingPrice || Number(startingPrice) <= 0) {
      toast.error("Vui lòng nhập giá khởi điểm hợp lệ!");
      return;
    }
    if (!instantPrice || Number(instantPrice) <= 0) {
      toast.error("Vui lòng nhập giá mua ngay hợp lệ!");
      return;
    }
    if (!priceStep || Number(priceStep) <= 0) {
      toast.error("Vui lòng nhập bước giá hợp lệ!");
      return;
    }
    if (!desc) {
      toast.error("Vui lòng nhập mô tả sản phẩm!");
      return;
    }

    setSubmit(true);

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
    formData.append("auto_renew", e.target.autoRenew?.checked || false);
    formData.append("end_date_time", date ? date.toISOString() : "");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product/create`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok || data.code !== "success") {
        toast.error(data.message || "Tạo sản phẩm thất bại!");
        setSubmit(false);
        return;
      }

      toast.success(data.message || "Tạo sản phẩm thành công!");
      router.push("/admin/product");
    } catch (error) {
      toast.error("Lỗi khi tạo sản phẩm!");
      setSubmit(false);
    }
  }

  return (
    <>
      <div className="text-[24px] font-semibold text-[var(--main-color)] mt-6 mb-6">Thêm sản phẩm mới</div>
      <form id="adminProductCreateForm" className="bg-white w-full p-8 rounded-[14px] border border-[#B9B9B9]" onSubmit={handleSubmit}>
        <div className="flex gap-[30px] mb-6">
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
                  <span>{categoryName}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categoryList.length > 0 && renderCategoryTree(categoryTree, 0, (id, name) => {
                  setCategory(id);
                  setCategoryName(name);
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <Label
            htmlFor="image"
            className="text-sm font-semibold text-[#606060]"
          >
            Hình ảnh sản phẩm (tối thiểu 3 ảnh)
          </Label>
          <ImageUploader
            value={imageList}
            onChange={setImageList}
            maxFiles={10}
            id="image"
            name="image"
          />
        </div>

        <div className="flex gap-5 mb-6">
          <div className="w-full flex flex-col gap-3">
            <Label
              htmlFor="price"
              className="text-sm font-semibold text-[#606060]"
            >
              Giá hiện tại
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
              Bước nhảy giá
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

        <div className="mb-6">
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
            <Checkbox id="autoRenew" name="autoRenew" className="data-[state=checked]:bg-[var(--main-color)]" />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3">
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

        <div className="flex flex-col items-center gap-4">
          <Button disabled={submit} type="submit" className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-full font-bold text-lg">
            {submit ? "Đang tạo..." : "Tạo sản phẩm"}
          </Button>
          <Link href="/admin/product" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}
