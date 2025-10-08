# 🌐 Frontend

Giao diện người dùng của dự án, được xây dựng bằng **React + Vite + TailwindCSS**.

## 🚀 Tech Stack

- ⚛️ **React** — Thư viện UI hiện đại  
- ⚡ **Vite** — Dev server nhanh và gọn nhẹ  
- 🎨 **TailwindCSS** — Framework CSS tiện lợi  
- 🧹 **Biome** — Dùng cho format và lint code

---

## 📦 Cài đặt

```bash
# Cài dependencies
npm install
```

---

## 🧑‍💻 Chạy dự án

```bash
# Chạy môi trường phát triển
npm run dev
```

Mặc định chạy tại: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Kiểm tra & Format code

```bash
# Format code với Biome
npm run format
```

---

## 👀 Xem trước bản build

```bash
# Build production
npm run build

# Preview bản build (dùng Vite)
npm run preview
```

---

## 📁 Cấu trúc thư mục

```
client/
├── src/
│   ├── components/      # Các thành phần UI
│   ├── pages/           # Các trang chính
│   ├── assets/          # Hình ảnh, icon,...
│   ├── hooks/           # Custom hooks
│   └── main.jsx         # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 💡 Ghi chú

- Sử dụng **Biome** thay cho ESLint + Prettier để thống nhất style và tốc độ format nhanh hơn.  
- Khi commit, nên đảm bảo đã chạy `npm run format` để giữ codebase sạch.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
