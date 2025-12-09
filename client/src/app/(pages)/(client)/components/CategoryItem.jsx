import Link from "next/link"

export const CategoryItem = ({ item }) => {
  return (
    <>
      <Link href={`/category/${item.id_category}`}>
        <div className="w-full bg-white rounded-[10px] shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
          <div className="w-full h-[250px] overflow-hidden">
            <img
              src="/category.webp"
              alt={item.name_category}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="p-3">
            <div className="font-bold text-gray-900 text-[20px] truncate">
              {item.name_category}
            </div>
            {/* <p className="text-gray-500 text-sm line-clamp-1 mt-1">
            {item.description}
          </p> */}
          </div>
        </div>
      </Link>
    </>
  )
}