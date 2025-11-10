import { CategoryItem } from "../components/CategoryItem";
import CategoryListPagination from "./components/CategoryListPagination";

export default function CategoryListPage() {
  const categories = [
    {
      image: "/category1.jpg",
      name: "Đồ công nghệ",
      description: "Các thiết bị công nghệ hiện đại và tiên tiến",
    },
    {
      image: "/category2.jpg",
      name: "Đồ trang sức",
      description: "Trang sức tinh xảo và độc đáo",
    },
    {
      image: "/category1.jpg",
      name: "Đồ công nghệ",
      description: "Các thiết bị công nghệ hiện đại và tiên tiến",
    },
    {
      image: "/category2.jpg",
      name: "Đồ trang sức",
      description: "Trang sức tinh xảo và độc đáo",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-[30px] mb-[30px]">
        {categories.map((item, index) => (
          <CategoryItem
            key={index}
            item={item}
          />
        ))}
      </div>
      <CategoryListPagination currentPage={1} totalPages={10} />
    </>
  )
}