"use client"

import { Badge } from "@/components/ui/badge";
import { AdminDeleteButton } from "../../components/TableButton/DeleteButton";
import { AdminEditButton } from "../../components/TableButton/EditButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { getCategoryList } from "@/lib/adminAPI/category";
import { buildParams } from "@/helper/params";

export default function CategoryTable({ filter }) {
  const [categoryList, setCategoryList] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const params = buildParams(filter);
      const promise = await getCategoryList(params);
      if (promise.code == "success")
      {
        setCategoryList(promise.data);
      }
    } 
    fetchData();
  }, [filter])

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th className="p-3 w-10">
              <Checkbox className="data-[state=checked]:bg-[var(--main-color)]"/>
            </th>
            <th className="p-3 text-left">Tên danh mục</th>
            <th className="p-3 text-left">Danh mục cha</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categoryList.length > 0 && categoryList.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 text-center">
                <Checkbox className="data-[state=checked]:bg-[var(--main-color)]"/>
              </td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.parent_name ? <Badge variant="secondary">{item.parent_name}</Badge> : <Badge variant="outline">Danh mục gốc</Badge>}</td>
              <td className="p-3 flex items-center justify-center gap-2">
                <AdminEditButton />
                <AdminDeleteButton />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
