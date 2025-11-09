import Link from "next/link";

export const NavBar = () => {
  return (
    <>
      <div className="flex items-center gap-[30px] flex-1 justify-center font-regular text-[15px]">
        <Link href="#" className="hover:underline">Trang chủ</Link>
        <Link href="#" className="hover:underline">Đấu giá</Link>
        <Link href="#" className="hover:underline">Kết quả</Link>
        <Link href="#" className="hover:underline">Liên hệ</Link>
      </div>
    </>
  );
}