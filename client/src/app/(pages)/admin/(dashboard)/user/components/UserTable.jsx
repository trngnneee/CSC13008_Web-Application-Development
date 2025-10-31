import { Badge } from "@/components/ui/badge";
import { AdminDeleteButton } from "../../components/TableButton/DeleteButton";
import { AdminEditButton } from "../../components/TableButton/EditButton";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserTable() {
  const data = [
    {
      id: 1,
      name: "Người dùng 1",
      image: "https://i.imgur.com/2yaf2wb.jpeg",
      position: 1,
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "Người dùng 2",
      image: "https://i.imgur.com/2yaf2wb.jpeg",
      position: 2,
      status: "Tạm dừng",
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
            <th className="p-3 text-left">Ảnh đại diện</th>
            <th className="p-3 text-center">Vị trí</th>
            <th className="p-3 text-center">Trạng thái</th>
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
              <td className="p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
              </td>
              <td className="p-3 text-center">{item.position}</td>
              <td className="p-3 text-center">
                {item.status === "Hoạt động" ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 border-none">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-600 border-none">
                    Tạm dừng
                  </Badge>
                )}
              </td>
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
