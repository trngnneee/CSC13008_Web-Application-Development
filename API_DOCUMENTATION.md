# SnapBid API Documentation

## Base URL

```
Local: http://localhost:3001
```

## Response Format

Tất cả API responses đều có định dạng như sau:

```json
{
  "code": "success|error",
  "message": "Mô tả thao tác",
  "data": {} // Optional, tuỳ thuộc từng endpoint
}
```

---

## Authentication

### Token Types

- `clientToken`: Token cho client (bidder/seller)
- `adminToken`: Token cho admin

### Token Delivery

Token có thể được gửi qua:

1. **Cookie**: `clientToken` hoặc `adminToken` (tự động gửi từ browser)
2. **Authorization Header**: `Authorization: Bearer {token}`

---

## 📋 Table of Contents

1. [Client - Account Management](#client---account-management)
2. [Admin - Account Management](#admin---account-management)
3. [Category Management](#category-management)
4. [Product Management](#product-management)
5. [User Upgrade Request](#user-upgrade-request)
6. [Client - User Routes](#client---user-routes)

---

## Client - Account Management

### Base Path: `/api/client/account`

#### 1. Register

- **Method**: `POST`
- **Path**: `/register`
- **Body**:

```json
{
  "fullname": "string",
  "email": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Đăng ký thành công / Email đã tồn tại / Seller role không thể đăng ký lại"
}
```

#### 2. Login

- **Method**: `POST`
- **Path**: `/login`
- **Body**:

```json
{
  "email": "string",
  "password": "string",
  "rememberPassword": "boolean (optional)"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Đăng nhập thành công / Sai mật khẩu / Email không tồn tại",
  "data": {
    "id_user": "uuid",
    "email": "string",
    "fullname": "string",
    "role": "bidder|seller"
  }
}
```

- **Note**: Token được set vào cookie `clientToken`

#### 3. Verify Token

- **Method**: `GET`
- **Path**: `/verifyToken`
- **Auth**: Required (Cookie hoặc Header)
- **Response**:

```json
{
  "code": "success|error",
  "message": "Token hợp lệ",
  "data": {
    "id_user": "uuid",
    "email": "string",
    "fullname": "string",
    "role": "bidder|seller"
  }
}
```

#### 4. Forgot Password

- **Method**: `POST`
- **Path**: `/forgot-password`
- **Body**:

```json
{
  "email": "string"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Email xác nhận đã được gửi"
}
```

#### 5. Verify Email (Forgot Password)

- **Method**: `GET`
- **Path**: `/verify-email?token={token}&email={email}`
- **Response**:

```json
{
  "code": "success|error",
  "message": "Email xác nhận thành công / Token hết hạn"
}
```

#### 6. OTP Password (Forgot Password)

- **Method**: `POST`
- **Path**: `/otp-password`
- **Body**:

```json
{
  "email": "string",
  "otp": "string"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "OTP hợp lệ / OTP không hợp lệ"
}
```

#### 7. Reset Password

- **Method**: `POST`
- **Path**: `/reset-password`
- **Auth**: Required
- **Body**:

```json
{
  "newPassword": "string"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Đổi mật khẩu thành công"
}
```

---

## Admin - Account Management

### Base Path: `/api/admin/account`

#### 1. Register (Admin)

- **Method**: `POST`
- **Path**: `/register`
- **Body**:

```json
{
  "fullname": "string",
  "email": "string",
  "password": "string"
}
```

- **Response**: Giống như client register

#### 2. Login (Admin)

- **Method**: `POST`
- **Path**: `/login`
- **Body**: Giống như client login
- **Response**: Giống như client login, nhưng token được set vào cookie `adminToken`

#### 3. Verify Token (Admin)

- **Method**: `GET`
- **Path**: `/verifyToken`
- **Auth**: Required
- **Response**: Giống như client verifyToken

#### 4. Forgot Password (Admin)

- **Method**: `POST`
- **Path**: `/forgot-password`
- **Body**: Giống như client
- **Response**: Giống như client

#### 5. Verify Email (Admin)

- **Method**: `GET`
- **Path**: `/verify-email?token={token}&email={email}`
- **Response**: Giống như client

#### 6. OTP Password (Admin)

- **Method**: `POST`
- **Path**: `/otp-password`
- **Body**: Giống như client
- **Response**: Giống như client

#### 7. Reset Password (Admin)

- **Method**: `POST`
- **Path**: `/reset-password`
- **Auth**: Required
- **Body**: Giống như client
- **Response**: Giống như client

#### 8. Get All Users

- **Method**: `GET`
- **Path**: `/get-all-users?page={page}&keyword={keyword}`
- **Auth**: Required (Admin only)
- **Query Parameters**:
  - `page`: number (optional, default: không phân trang)
  - `keyword`: string (optional, lọc theo email hoặc fullname)
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy danh sách người dùng thành công",
  "data": [
    {
      "id_user": "uuid",
      "email": "string",
      "fullname": "string",
      "role": "bidder|seller|admin",
      "status": "active|email_verified",
      "created_at": "timestamp"
    }
  ]
}
```

#### 9. Change User Role

- **Method**: `PATCH`
- **Path**: `/change-role/:id_user`
- **Auth**: Required (Admin only)
- **Body**:

```json
{
  "role": "bidder|seller|admin"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Thay đổi role thành công / Người dùng không tồn tại"
}
```

---

## Category Management

### Base Path: `/api/admin/category`

#### 1. Get Category List

- **Method**: `GET`
- **Path**: `/list?page={page}&keyword={keyword}`
- **Query Parameters**:
  - `page`: number (optional)
  - `keyword`: string (optional, tìm kiếm theo tên)
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "id_parent": "uuid|null",
      "parent_name": "string|null"
    }
  ]
}
```

#### 2. Get Category Detail

- **Method**: `GET`
- **Path**: `/:id`
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy chi tiết category thành công",
  "data": {
    "id_category": "uuid",
    "name_category": "string",
    "id_parent_category": "uuid|null",
    "parent_category_name": "string|null"
  }
}
```

#### 3. Create Category

- **Method**: `POST`
- **Path**: `/create`
- **Body**:

```json
{
  "name": "string",
  "parent": "uuid|null (optional, nếu là subcategory)"
}
```

- **Response**:

```json
{
  "code": "success",
  "message": "Tạo danh mục thành công"
}
```

#### 4. Update Category

- **Method**: `PUT`
- **Path**: `/:id`
- **Body**:

```json
{
  "name": "string (optional)",
  "id_parent": "uuid|null (optional)"
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Cập nhập category thành công / Không tìm thấy category",
  "data": {
    "id_category": "uuid",
    "name_category": "string",
    "id_parent_category": "uuid|null"
  }
}
```

#### 5. Delete Category

- **Method**: `DELETE`
- **Path**: `/delete/:id`
- **Note**: Chỉ xóa được category chưa có sản phẩm nào
- **Response**:

```json
{
  "code": "success|error",
  "message": "Xóa category thành công / Category đang có sản phẩm / Không tìm thấy category"
}
```

#### 6. Delete Multiple Categories

- **Method**: `DELETE`
- **Path**: `/delete-list`
- **Body**:

```json
{
  "ids": ["uuid", "uuid", ...]
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Xóa danh sách category thành công"
}
```

#### 7. Get Total Pages

- **Method**: `GET`
- **Path**: `/total-page`
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy tổng số trang thành công",
  "data": 5
}
```

---

## Product Management

### Base Path: `/api/admin/product`

#### 1. Upload CSV Products

- **Method**: `POST`
- **Path**: `/upload-csv`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: File CSV/Excel
- **CSV Columns Required**:
  - `name`: string
  - `id_category`: uuid hoặc category name
  - `avatar`: string (URL)
  - `price`: number
  - `immediate_purchase_price`: number
  - `posted_date_time`: timestamp
  - `end_date_time`: timestamp
  - `description`: string
  - `judge_point`: number
  - `pricing_step`: number
  - `starting_price`: number
  - `url_img`: array of URLs (optional)
- **Response**:

```json
{
  "code": "success",
  "message": "Upload sản phẩm thành công",
  "data": {
    "total": 100,
    "inserted": 98,
    "failed": 2,
    "errors": [
      {
        "indexFrom": 5,
        "indexTo": 5,
        "message": "Error message",
        "rowPreview": {}
      }
    ]
  }
}
```

#### 2. Get Product List

- **Method**: `GET`
- **Path**: `/list?page={page}&keyword={keyword}`
- **Query Parameters**:
  - `page`: number (optional)
  - `keyword`: string (optional, tìm kiếm theo tên)
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    {
      "id_product": "uuid",
      "name": "string",
      "id_category": "uuid",
      "avatar": "string",
      "price": 0,
      "immediate_purchase_price": 0,
      "description": "string",
      "judge_point": 0,
      "pricing_step": 0,
      "starting_price": 0,
      "url_img": ["url1", "url2"],
      "created_at": "timestamp"
    }
  ]
}
```

#### 3. Get Product Detail

- **Method**: `GET`
- **Path**: `/:id`
- **Response**: Giống như get product list nhưng trả về 1 object thay vì array

#### 4. Update Product

- **Method**: `PUT`
- **Path**: `/:id`
- **Body**: Tất cả fields đều optional

```json
{
  "name": "string",
  "id_category": "uuid",
  "avatar": "string",
  "price": 0,
  "immediate_purchase_price": 0,
  "posted_date_time": "timestamp",
  "end_date_time": "timestamp",
  "description": "string",
  "judge_point": 0,
  "pricing_step": 0,
  "starting_price": 0,
  "url_img": ["url1", "url2"]
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Cập nhập sản phẩm thành công / Không tìm thấy sản phẩm",
  "data": {}
}
```

#### 5. Delete Product

- **Method**: `DELETE`
- **Path**: `/delete/:id`
- **Response**:

```json
{
  "code": "success",
  "message": "Xóa sản phẩm thành công"
}
```

#### 6. Delete Multiple Products

- **Method**: `DELETE`
- **Path**: `/delete-list`
- **Body**:

```json
{
  "ids": ["uuid", "uuid", ...]
}
```

- **Response**:

```json
{
  "code": "success|error",
  "message": "Xóa danh sách sản phẩm thành công"
}
```

#### 7. Get Total Pages

- **Method**: `GET`
- **Path**: `/total-page`
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy danh sách sản phẩm thành công",
  "data": 20
}
```

---

## Client - Product Routes

### Base Path: `/api/client/product`

#### 1. Get Product List

- **Method**: `GET`
- **Path**: `/list?page={page}&keyword={keyword}`
- **Query Parameters**:
  - `page`: number (optional)
  - `keyword`: string (optional)
- **Response**: Giống như admin product list

#### 2. Get Total Pages

- **Method**: `GET`
- **Path**: `/total-page`
- **Response**: Giống như admin product total-page

#### 3. Get Products By Category

- **Method**: `GET`
- **Path**: `/list-category/:id_category?page={page}&keyword={keyword}`
- **Query Parameters**:
  - `page`: number (optional)
  - `keyword`: string (optional)
- **Response**: Giống như get product list

#### 4. Get Total Pages By Category

- **Method**: `GET`
- **Path**: `/total-page-category/:id_category`
- **Response**: Trả về tổng số trang sản phẩm của danh mục đó

---

## User Upgrade Request

### Admin Routes

**Base Path**: `/api/admin/upgrade_request`

#### 1. Get Upgrade Requests List

- **Method**: `GET`
- **Path**: `/list?page={page}&status={status}`
- **Auth**: Required (Admin only)
- **Query Parameters**:
  - `page`: number (optional)
  - `status`: "pending|approved|rejected" (optional)
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy danh sách yêu cầu nâng cấp thành công!",
  "data": [
    {
      "id_request": "uuid",
      "id_user": "uuid",
      "fullname": "string",
      "email": "string",
      "role": "bidder",
      "status": "pending|approved|rejected",
      "created_at": "timestamp",
      "reviewed_at": "timestamp|null",
      "reviewed_by": "uuid|null"
    }
  ]
}
```

#### 2. Get Upgrade Request Detail

- **Method**: `GET`
- **Path**: `/:id`
- **Auth**: Required (Admin only)
- **Response**: Trả về 1 object thay vì array

#### 3. Approve Upgrade Request

- **Method**: `PUT`
- **Path**: `/:id/approve`
- **Auth**: Required (Admin only)
- **Response**:

```json
{
  "code": "success|error",
  "message": "Đã duyệt yêu cầu nâng cấp thành công! / Không tìm thấy yêu cầu nâng cấp!",
  "data": {
    "id_request": "uuid",
    "status": "approved",
    "reviewed_by": "admin_uuid",
    "reviewed_at": "timestamp"
  }
}
```

- **Note**: User role sẽ tự động được thay đổi từ "bidder" thành "seller"

#### 4. Reject Upgrade Request

- **Method**: `PUT`
- **Path**: `/:id/reject`
- **Auth**: Required (Admin only)
- **Response**:

```json
{
  "code": "success|error",
  "message": "Đã từ chối yêu cầu nâng cấp thành công! / Không tìm thấy yêu cầu nâng cấp!",
  "data": {
    "id_request": "uuid",
    "status": "rejected",
    "reviewed_by": "admin_uuid",
    "reviewed_at": "timestamp"
  }
}
```

#### 5. Get Total Pages

- **Method**: `GET`
- **Path**: `/total-page?status={status}`
- **Auth**: Required (Admin only)
- **Query Parameters**:
  - `status`: "pending|approved|rejected" (optional)
- **Response**:

```json
{
  "code": "success",
  "message": "Lấy tổng số trang thành công!",
  "data": 3
}
```

---

## Client - User Routes

### Base Path: `/api/client/users`

#### 1. Request Upgrade to Seller

- **Method**: `POST`
- **Path**: `/request-upgrade`
- **Auth**: Required (Client only)
- **Note**:
  - Chỉ bidder mới có thể gửi yêu cầu
  - Admin không thể nâng cấp thành seller
  - Seller không thể gửi yêu cầu lần nữa
  - Chỉ 1 yêu cầu pending được phép lúc một
- **Response**:

```json
{
  "code": "success|error",
  "message": "Gửi yêu cầu nâng cấp thành công! Vui lòng chờ admin duyệt. / Admin không thể nâng cấp thành seller! / Bạn đã là seller rồi! / Bạn đã có một yêu cầu nâng cấp đang chờ xử lý!",
  "data": {
    "id_request": "uuid",
    "id_user": "uuid",
    "status": "pending",
    "created_at": "timestamp"
  }
}
```

#### 2. Get My Upgrade Request

- **Method**: `GET`
- **Path**: `/my-upgrade-request`
- **Auth**: Required (Client only)
- **Response**:

```json
{
  "code": "success|error",
  "message": "Lấy yêu cầu nâng cấp thành công! / Không có yêu cầu nâng cấp nào!",
  "data": {
    "id_request": "uuid",
    "id_user": "uuid",
    "status": "pending|approved|rejected",
    "created_at": "timestamp",
    "reviewed_at": "timestamp|null"
  }
}
```

---

## Error Codes & Status Codes

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

### Response Codes

- `success`: Thao tác thành công
- `error`: Có lỗi xảy ra

---

## Authentication Examples

### Using Cookie (Browser)

```javascript
// Browser tự động gửi cookie
fetch("http://localhost:3001/api/client/users/my-upgrade-request").then((res) =>
  res.json()
);
```

### Using Authorization Header (Postman/API Client)

```bash
GET http://localhost:3001/api/client/users/my-upgrade-request
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Notes

- Tất cả timestamp đều ở dạng ISO 8601 (ví dụ: `2024-12-03T10:30:00Z`)
- UUID được sử dụng làm primary key cho tất cả entities
- Pagination mặc định là 5 items/page
- Token hết hạn: Gửi lại request với token mới
- CORS đã được cấu hình để hỗ trợ cross-origin requests
