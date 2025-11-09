import { Button } from "@/components/ui/button"

export const Section2 = () => {
  return (
    <>
      <div className="w-full h-screen bg-[var(--main-client-color)]">
        <div className="container mx-auto flex justify-between gap-[80px]">
          <div className="w-[60%]">
            <img
              src="/shape2.png"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white flex justify-center items-center flex-col w-full">
            <div className="font-extrabold text-[100px] leading-tight mb-[50px]">Định giá, Mua, Bán</div>
            <div className="text-[20px] font-regular mb-[30px]">Chúng tôi mang đến trải nghiệm mua sắm khác biệt, kết hợp sự hào hứng của đấu giá truyền thống với tiện ích và tốc độ của công nghệ hiện đại.</div>
            <div className="w-full flex items-center gap-[30px]">
              <Button className="bg-transparent hover:bg-[#00000018] hover:scale-[1.1] transition-all duration-300 border-white border-2 text-white">
                Đấu giá ngay
              </Button>
              <Button className="bg-transparent hover:bg-[#00000018] hover:scale-[1.1] transition-all duration-300 border-white border-2 text-white">
                Trở thành người bán
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}