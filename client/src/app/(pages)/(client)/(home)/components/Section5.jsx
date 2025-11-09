import { Button } from "@/components/ui/button"

export const Section5 = () => {
  return (
    <>
      <div className="w-full h-[500px] bg-[url('/bg2.png')] bg-cover flex justify-center items-center">
        <div className="flex justify-center items-center gap-20">
          <div className="font-extrabold text-[100px] leading-tight">
            About <br/> SnapBid 
          </div>
          <div className="max-w-[600px]">
            <div className="text-[20px] mb-[30px]">
              Tại SnapBid, chúng tôi tin rằng mua sắm không chỉ là trao đổi – mà còn là trải nghiệm. <br/> Chúng tôi cam kết mang đến cho bạn một nền tảng đấu giá trực tuyến an toàn, minh bạch và dễ sử dụng, nơi bạn có thể khám phá những món đồ độc đáo và quý hiếm từ khắp nơi trên thế giới. 
            </div>
            <Button className="bg-transparent hover:bg-[#00000018] border border-black shadow-none text-black">Tìm hiểu thêm</Button>
          </div>
        </div>
      </div>
    </>
  )
}