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
import { useEffect, useState } from "react";
import Link from "next/link";
import { createCategory, getCategoryList } from "@/lib/adminAPI/category";
import { buildCategoryTree, renderCategoryTree } from "@/helper/category";
import JustValidate from "just-validate";
import { toastHandler } from "@/lib/toastHandler";
import { useRouter } from "next/navigation";

export default function AdminCategoryCreate() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

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
        name: name,
        parent: category || null,
      }
      const promise = createCategory(finalData);
      toastHandler(promise, router, "/admin/category");
    }
  }

  return (
    <>
      <DashboardTitle title="Tạo danh mục" />
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
              <DropdownMenuTrigger asChild id="category">
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
          <Button disabled={submit} className="bg-[var(--main-color)] hover:bg-[var(--main-hover)] w-1/4 font-bold text-lg">Tạo danh mục</Button>
          <Link href="/admin/category" className="text-[var(--main-color)] hover:text-[var(--main-hover)] hover:underline mt-5">Quay trở lại danh sách</Link>
        </div>
      </form>
    </>
  );
}