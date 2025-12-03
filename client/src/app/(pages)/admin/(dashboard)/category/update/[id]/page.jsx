"use client"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategoryList, getDetailCategory, updateCategory } from "@/lib/adminAPI/category";
import { buildCategoryTree, renderCategoryTree } from "@/helper/category";
import JustValidate from "just-validate";
import { toastHandler } from "@/lib/toastHandler";
import { useParams, useRouter } from "next/navigation";
import { DashboardTitle } from "../../../components/DashboardTitle";

export default function AdminCategoryUpdate() {
  const router = useRouter();
  const { id } = useParams();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const [categoryDetail, setCategoryDetail] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);

  const [submit, setSubmit] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const promise = await getCategoryList();
      if (promise.code == "success")
      {
        setCategoryList(promise.data);
        setCategoryTree(buildCategoryTree(promise.data));
      }
      const promise2 = await getDetailCategory(id);
      if (promise2.code == "success")
      {
        setName(promise2.data.name_category);
        setCategory(promise2.data.id_parent_category || "");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const validation = new JustValidate("#create-category-form");

    validation.addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên danh mục",
      },
      {
        rule: "maxLength",
        value: 100,
        errorMessage: "Tên danh mục không được vượt quá 100 ký tự",
      },
    ])
      .onSuccess(() => {
        setSubmit(true);
      });
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submit) 
    {
      const finalData = {
        name_category: name,
        id_parent_category: category || null,
      }
      const promise = updateCategory(id, finalData);
      toastHandler(promise, router, "/admin/category");
    }
  }

  return (
    <>
      <DashboardTitle title="Chỉnh sửa danh mục" />
      <form onSubmit={handleSubmit} id="create-category-form" className="bg-white w-full p-12.5 rounded-[14px] mt-[30px] border border-[#B9B9B9]">
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
              <DropdownMenuTrigger asChild id="category" readOnly>
                <Button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{categoryList.find((item) => item.id == category)?.name || "--Chọn danh mục--"}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategory("")}>--Chọn danh mục--</DropdownMenuItem>
                {categoryList.length > 0 && renderCategoryTree(categoryTree, 0, setCategory)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col items-center mt-[30px]">
          <Button disabled={submit} className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Lưu</Button>
          <Link href="/admin/category" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}