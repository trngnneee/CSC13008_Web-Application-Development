"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { AdminRejectButton } from "../../../components/TableButton/RejectButton";
import { AdminApproveButton } from "../../../components/TableButton/ApproveButton";
import { useEffect, useState } from "react";
import { adminUserRequest } from "@/lib/adminAPI/user";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date";

export default function SellerTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fecthData = async () => {
      const promise = await adminUserRequest();
      if (promise.code == "success") {
        setData(promise.data)
      }
    }
    fecthData();
  }, [])

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Thời gian yêu cầu</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-left">Duyệt lúc</th>
            <th className="p-3 text-left">Duyệt bởi</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 && data.map((item, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">{item.fullname}</td>
              <td className="p-3">{item.email}</td>
              <td className="p-3">{dateTimeFormat(item.created_at)}</td>
              <td className="p-3">
                {item.status === "pending" && (
                  <Badge>Pending</Badge>
                )}
                {item.status === "approved" && (
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                )}
                {item.status === "rejected" && (
                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                )}
              </td>
              <td className="p-3">{dateTimeFormat(item.reviewed_at) || "-"}</td>
              <td className="p-3">{item.admin_name || "-"}</td>
              {item.status === "pending" && (
                <td className="p-3 flex items-center justify-center gap-2">
                  <AdminApproveButton api={`${process.env.NEXT_PUBLIC_API_URL}/admin/user/upgrade-requests/${item.id_request}/approve`} />
                  <AdminRejectButton api={`${process.env.NEXT_PUBLIC_API_URL}/admin/user/upgrade-requests/${item.id_request}/reject`} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
