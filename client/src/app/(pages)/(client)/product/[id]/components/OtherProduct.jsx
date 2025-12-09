import { ProductItem } from "../../../components/ProductItem/ProductItem"

export const OtherProduct = () => {
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
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
  ]
  
  return (
    <>
      <div className="grid grid-cols-4 gap-[30px] mt-2.5">
        {data.map((item, index) => (
          <ProductItem
            key={index}
            item={item}
          />
        ))}
      </div>
    </>
  )
}