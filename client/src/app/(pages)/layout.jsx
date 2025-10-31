import "./../globals.css";

export const metadata = {
  title: "Online Auction",
  description: "Sàn Đấu Giá Trực Tuyến",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
