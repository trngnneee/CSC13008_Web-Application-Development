import { Toaster } from "sonner";
import "./../globals.css";

export const metadata = {
  title: "Online Auction",
  description: "Sàn Đấu Giá Trực Tuyến",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F6FA]">
        <Toaster/>
        {children}
      </body>
    </html>
  );
}
