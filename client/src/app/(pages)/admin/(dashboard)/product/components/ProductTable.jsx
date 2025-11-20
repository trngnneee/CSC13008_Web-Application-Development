import { AdminDeleteButton } from "../../components/TableButton/DeleteButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { productList } from "@/lib/adminAPI/product";

export default function ProductTable({ filter, selectedItem, setSelectedItem }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      let params = "";
      if (filter.keyword) {
        params += `?keyword=${filter.keyword}`;
      }
      if (filter.page) {
        params += params ? `&page=${filter.page}` : `?page=${filter.page}`;
      }
      const promise = await productList(params);
      if (promise.code == "success") {
        setData(promise.data);
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
              <Checkbox
                className="data-[state=checked]:bg-[var(--main-color)]"
                checked={data.length > 0 && selectedItem.length === data.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedItem(data.map((item) => item.id_product));
                  } else {
                    setSelectedItem([]);
                  }
                }}
              />
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
          {data.length > 0 && data.map((item) => (
            <tr
              key={item.id_product}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 text-center">
                <Checkbox
                  className="data-[state=checked]:bg-[var(--main-color)]"
                  checked={selectedItem.includes(item.id_product)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItem([...selectedItem, item.id_product]);
                    } else {
                      setSelectedItem(selectedItem.filter((id) => id !== item.id_product));
                    }
                  }}
                />
              </td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
              </td>
              <td className="p-3 text-center">{item.name_category}</td>
              <td className="p-3 text-center">{parseInt(item.price).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center">{parseInt(item.starting_price).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center">{parseInt(item.immediate_purchase_price).toLocaleString("vi-VN")}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{(new Date(item.posted_date_time)).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
              <td className="p-3 text-center text-[12px] text-gray-500">{(new Date(item.end_date_time)).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
              <td className="p-3 text-center">{parseInt(item.pricing_step).toLocaleString("vi-VN")}</td>
              <td className="p-3 flex items-center justify-center gap-2">
                <AdminDeleteButton
                  api={`${process.env.NEXT_PUBLIC_API_URL}/admin/product/delete/${item.id_product}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
