import CategoryPagination from "../../category/[id]/components/CategoryPagination";
import { ProductItem } from "../../components/ProductItem";
import { HeaderTitle } from "../components/HeaderTitle";

export default function WishlistPage() {
  const data = [
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product2.png",
      name: "Plant and Pots",
      seller: "Jose Guillermo",
      currentBid: "1200",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    }
  ]

  return (
    <>
      <HeaderTitle title="Danh sách yêu thích" />
      <div
        className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
      >
        {data.map((item, index) => (
          <ProductItem
            key={index}
            item={item}
          />
        ))}
      </div>
      <CategoryPagination
        currentPage={1}
        totalPages={10}
      />
    </>
  )
}