import { Toaster } from "sonner";
import "./../globals.css";

export const metadata = {
  title: "SnapBid",
  description: "Sàn Đấu Giá Trực Tuyến",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster/>
        {children}
      </body>
    </html>
  );
}
