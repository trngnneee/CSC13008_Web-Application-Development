🛠 Project Environment Configuration

1. FRONTEND (Next.js)

Frontend được xây dựng bằng Next.js và sử dụng biến môi trường thông qua file `.env.local`.

Biến môi trường cần thiết:
NEXT_PUBLIC_TINY_MCE_API_KEY=fspjvpatl3hzr9lgsffg9p64hr4caoewmxqnxhidilhdkvqa
NEXT_PUBLIC_API_URL=[http://localhost:10000/api](http://localhost:10000/api)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LduYicsAAAAAFgEn7PF0A-Qep_tcTY1sSlcOe1E
NEXT_PUBLIC_RECAPTCHA_SECRET_KEY=6LduYicsAAAAAFFVqvijlQxMTGH087gh_JQrw1H3

Lưu ý:

* Các biến có tiền tố NEXT_PUBLIC_ sẽ được expose cho frontend.
* Sau khi chỉnh sửa biến môi trường, cần restart server Next.js.

Cài đặt và chạy frontend:

1. Cài đặt dependencies: npm install
2. Chạy development server: npm run dev

Frontend mặc định chạy trên: [http://localhost:3000](http://localhost:3000)

2. BACKEND (Express.js)

Backend được xây dựng bằng Express.js và chạy trên cổng 10000.

Biến môi trường cần thiết trong file `.env`:
DB_PASSWORD='29070605'
DB_HOST='aws-1-ap-southeast-1.pooler.supabase.com'
DB_USER='postgres.vyotmuejhxfaiwmljmhv'
JWT_SECRET="VERY_SECRET_KEY_FOR_JWT_TOKEN"
EMAIL_NAME = "[ddkhoa9@gmail.com](mailto:ddkhoa9@gmail.com)"
EMAIL_PASSWORD = "yjyx pcrc zevq glhx"
FRONTEND_URL = "[http://localhost:3000](http://localhost:3000)"
SUPABASE_URL="[https://vyotmuejhxfaiwmljmhv.supabase.co](https://vyotmuejhxfaiwmljmhv.supabase.co)"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b3RtdWVqaHhmYWl3bWxqbWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5MjAzNCwiZXhwIjoyMDc1NDY4MDM0fQ.jo8j4Yuj3bmPRUI8GUlMiUipPYjW_XX6GYy2AZ9UcJA"
CLOUDINARY_API_KEY="834668983718514"
CLOUDINARY_SECRET_API="KI_mVAdKhFNvtbJN4w9TWSzJqno"

Cài đặt và chạy backend:

1. Cài đặt dependencies: npm install
2. Chạy development server: npm run dev

Backend mặc định chạy trên: [http://localhost:10000/api](http://localhost:10000/api)

* Nếu không khai báo PORT, server sẽ fallback về port 10000.