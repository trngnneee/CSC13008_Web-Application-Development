"use client"

import { useEffect, useState } from "react";
import { AdminDeleteButton } from "../../../components/TableButton/DeleteButton";
import { AdminEditButton } from "../../../components/TableButton/EditButton";
import { Checkbox } from "@/components/ui/checkbox";
import { adminUserList, adminUserTotalPage } from "@/lib/adminAPI/user";
import { roleVariable } from "@/config/variable";
import { dateFormat } from "@/utils/date";
import { buildParams } from "@/helper/params";

export default function UserTable({ filter }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const params = buildParams(filter);
      const promise = await adminUserList(params);
      if (promise.code == "success") {
        setData(promise.data)
      }
    }
    fetchData();
  }, [filter])

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="p-3 w-10">
                <Checkbox className="data-[state=checked]:bg-[var(--main-color)]" />
              </th>
              <th className="p-3 text-left">Họ tên</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Ngày sinh</th>
              <th className="p-3 text-center">Vai trò</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 && data.map((item) => (
              <tr
                key={item.id_user}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 text-center">
                  <Checkbox className="data-[state=checked]:bg-[var(--main-color)]" />
                </td>
                <td className="p-3">{item.fullname}</td>
                <td className="p-3 text-left">{item.email}</td>
                <td className="p-3 text-center">{dateFormat(item.date_of_birth) || "-"}</td>
                <td className="p-3 text-center">{roleVariable.find(role => role.value === item.role)?.label || "-"}</td>
                <td className="p-3 flex items-center justify-center gap-2">
                  <AdminEditButton />
                  <AdminDeleteButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
