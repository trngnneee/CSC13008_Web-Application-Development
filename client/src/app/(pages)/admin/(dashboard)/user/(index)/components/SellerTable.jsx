import { Checkbox } from "@/components/ui/checkbox";
import { AdminRejectButton } from "../../../components/TableButton/RejectButton";
import { AdminApproveButton } from "../../../components/TableButton/ApproveButton";

export default function SellerTable() {
  const data = [
    {
      id: 1,
      name: "Người dùng 1",
      email: "user1@example.com",
      date_of_birth: "01/01/1990",
    },
    {
      id: 2,
      name: "Người dùng 2",
      email: "user2@example.com",
      date_of_birth: "02/02/1992",
    }
  ];

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th className="p-3 w-10">
              <Checkbox className="data-[state=checked]:bg-[var(--main-color)]"/>
            </th>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-center">Ngày sinh</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 text-center">
                <Checkbox className="data-[state=checked]:bg-[var(--main-color)]"/>
              </td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.email}</td>
              <td className="p-3 text-center">{item.date_of_birth}</td>
              <td className="p-3 flex items-center justify-center gap-2">
                <AdminApproveButton />
                <AdminRejectButton />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
