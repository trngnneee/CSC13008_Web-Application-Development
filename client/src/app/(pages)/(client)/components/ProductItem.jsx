import { Button } from "@/components/ui/button"

export const ProductItem = ({ item }) => {
  return (
    <>
      <div className="p-5 bg-white shadow-2xl rounded-[10px] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        <div className="w-full h-[200px] overflow-hidden">
          <img
            src={item.image}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-[23px]">
          <div className="text-[30px] font-bold line-clamp-1">{item.name}</div>
          <div className="text-[15px]">by: <span className="font-bold">{item.seller}</span></div>
        </div>
        <div className="text-[20px] mt-[30px] border-b border-b-[black] pb-[10px] mb-[10px]">Current bid: $<span className="font-bold">{item.currentBid}</span></div>
        <div className="text-[10px] flex items-center gap-[5px]">
          <div className="w-4 h-4 rounded-full bg-amber-400"></div>
          <div>Kết thúc tại: <span className="font-bold">{item.end}</span></div>
        </div>
        <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] mt-[30px]">Đấu giá</Button>
      </div>
    </>
  )
}