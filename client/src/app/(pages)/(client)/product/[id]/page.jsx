import { BidHistory } from "./components/BidHistory";
import { ImageSlider } from "./components/ImageSlider";
import { OtherProduct } from "./components/OtherProduct";
import { ProdcutInformation } from "./components/ProductInformation";

export default function ProductPage() {
  return (
    <>
      <div className="container mx-auto py-[50px]">
        <div className="flex gap-[100px] mb-20">
          <ImageSlider />
          <ProdcutInformation />
        </div>
        <div className="mb-20">
          <div className="text-[30px] font-extrabold mb-2.5">Lịch sử đấu giá</div>
          <BidHistory />
        </div>
        <div>
          <div className="text-[30px] font-extrabold">Các sản phẩm khác</div>
          <OtherProduct />
        </div>
      </div>
    </>
  )
}