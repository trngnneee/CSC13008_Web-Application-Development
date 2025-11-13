import { Badge } from "@/components/ui/badge";
import { AdminDeleteButton } from "../../components/TableButton/DeleteButton";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductTable() {
  const data = [
    {
      id: 1,
      name: "Sản phẩm 1",
      image: "https://i.imgur.com/2yaf2wb.jpeg",
      category: 1,
      price: 1000,
      startingPrice: 800,
      buyNowPrice: 1200,
      startTime: "2024-10-20 16:30",
      endTime: "2024-10-27 16:30",
      step: 50,
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
            <th className="p-3 text-left">Tên sản phẩm</th>
            <th className="p-3 text-left">Ảnh đại diện</th>
            <th className="p-3 text-center">Danh mục</th>
            <th className="p-3 text-center">Giá</th>
            <th className="p-3 text-center">Giá khởi điểm</th>
            <th className="p-3 text-center">Giá mua ngay</th>
            <th className="p-3 text-center">Bắt đầu</th>
            <th className="p-3 text-center">Kết thúc</th>
            <th className="p-3 text-center">Bước nhảy</th>
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
              <td className="p-3 text-center">{item.category}</td>
              <td className="p-3 text-center">{item.price}</td>
              <td className="p-3 text-center">{item.startingPrice}</td>
              <td className="p-3 text-center">{item.buyNowPrice}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{item.startTime}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{item.endTime}</td>
              <td className="p-3 text-center">{item.step}</td>
              <td className="p-3 flex items-center justify-center gap-2">
                <AdminDeleteButton />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
