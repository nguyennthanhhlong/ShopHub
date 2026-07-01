# TÀI LIỆU ĐẶC TẢ API - HỆ THỐNG E-COMMERCE

> [!NOTE]
> Tài liệu này mô tả chi tiết các API (Application Programming Interface) của hệ thống thương mại điện tử, phục vụ cho giao diện người dùng (ShopAppClient - Next.js) và trang quản trị (AdminManager - React).

## 1. Tổng quan (Overview)
- **Base URL**: `http://localhost:8080/api` (hoặc domain thực tế)
- **Authentication**: Sử dụng **JWT (JSON Web Token)**. Các request yêu cầu quyền truy cập (Admin hoặc User) cần truyền token ở Header: `Authorization: Bearer <your_token>`
- **Content-Type**: Đa số các API sử dụng `application/json`, ngoại trừ các API upload file sử dụng `multipart/form-data`.
- **Phân quyền cơ bản**:
  - `/api/public/**`: Truy cập công khai hoặc chỉ cần đăng nhập bằng quyền User.
  - `/api/admin/**`: Chỉ dành cho tài khoản có quyền Admin.

---

## 2. API Xác thực người dùng (Authentication)

### 2.1. Đăng ký tài khoản (Register)
- **Endpoint**: `POST /api/register`
- **Quyền**: Public
- **Request Body**: `UserDTO` (email, password, thông tin cá nhân cơ bản)
- **Response**: Trả về `jwt-token` dạng `{"jwt-token": "..."}` kèm HTTP Status 201 (Created).

### 2.2. Đăng nhập (Login)
- **Endpoint**: `POST /api/login`
- **Quyền**: Public
- **Request Body**: `LoginCredentials` (email, password)
- **Response**: Trả về `jwt-token` dạng `{"jwt-token": "..."}`.

---

## 3. API Quản lý Danh mục (Categories)

### 3.1. Lấy danh sách danh mục (Get Categories)
- **Endpoint**: `GET /api/public/categories`
- **Params**: `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Public
- **Response**: `CategoryResponse` (Bao gồm danh sách danh mục và thông tin phân trang).

### 3.2. Chi tiết danh mục (Get Category By ID)
- **Endpoint**: `GET /api/public/categories/{categoryId}`
- **Quyền**: Public
- **Response**: `CategoryDTO`

### 3.3. Thêm mới danh mục (Create Category)
- **Endpoint**: `POST /api/admin/categories`
- **Quyền**: Admin
- **Request Body**: `Category`
- **Response**: `CategoryDTO` vừa tạo.

### 3.4. Cập nhật danh mục (Update Category)
- **Endpoint**: `PUT /api/admin/categories/{categoryId}`
- **Quyền**: Admin
- **Request Body**: `Category`
- **Response**: `CategoryDTO` đã cập nhật.

### 3.5. Xóa danh mục (Delete Category)
- **Endpoint**: `DELETE /api/admin/categories/{categoryId}`
- **Quyền**: Admin
- **Response**: Message trạng thái xoá thành công.

---

## 4. API Quản lý Sản phẩm (Products)

### 4.1. Lấy danh sách sản phẩm (Get All Products)
- **Endpoint**: `GET /api/public/products`
- **Params**: `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Public
- **Response**: `ProductResponse` (Danh sách sản phẩm + phân trang).

### 4.2. Lấy danh sách 4 sản phẩm mới nhất (Top 4 Featured)
- **Endpoint**: `GET /api/public/products/top`
- **Quyền**: Public
- **Response**: `ProductResponse`.

### 4.3. Chi tiết sản phẩm (Get Product By ID)
- **Endpoint**: `GET /api/public/products/{productId}`
- **Quyền**: Public
- **Response**: `ProductDTO`.

### 4.4. Lấy sản phẩm theo danh mục (Products By Category)
- **Endpoint**: `GET /api/public/categories/{categoryId}/products`
- **Params**: `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Public
- **Response**: `ProductResponse`.

### 4.5. Tìm kiếm sản phẩm theo từ khóa (Search Products)
- **Endpoint**: `GET /api/public/products/keyword/{keyword}`
- **Params**: `categoryId`, `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Public
- **Response**: `ProductResponse`.

### 4.6. Xem hình ảnh sản phẩm (Get Product Image)
- **Endpoint**: `GET /api/public/products/image/{fileName}`
- **Quyền**: Public
- **Response**: Dữ liệu hình ảnh (`image/png`).

### 4.7. Thêm mới sản phẩm (Add Product)
- **Endpoint**: `POST /api/admin/categories/{categoryId}/products`
- **Quyền**: Admin
- **Request Body**: `Product`
- **Response**: `ProductDTO` vừa tạo (Status 201).

### 4.8. Cập nhật thông tin sản phẩm (Update Product)
- **Endpoint**: `PUT /api/admin/products/{productId}`
- **Quyền**: Admin
- **Request Body**: `Product`
- **Response**: `ProductDTO` cập nhật.

### 4.9. Cập nhật hình ảnh sản phẩm (Update Image)
- **Endpoint**: `PUT /api/admin/products/{productId}/image`
- **Quyền**: Admin
- **Request form-data**: `image` (MultipartFile)
- **Response**: `ProductDTO`.

### 4.10. Xóa sản phẩm (Delete Product)
- **Endpoint**: `DELETE /api/admin/products/{productId}`
- **Quyền**: Admin
- **Response**: Trạng thái chuỗi xoá thành công.

---

## 5. API Quản lý Giỏ hàng (Carts)

### 5.1. Lấy chi tiết giỏ hàng của User (Get User's Cart)
- **Endpoint**: `GET /api/public/users/{emailId}/carts/{cartId}`
- **Quyền**: Public / Authenticated User
- **Response**: `CartDTO`.

### 5.2. Thêm sản phẩm vào giỏ hàng (Add To Cart)
- **Endpoint**: `POST /api/public/carts/{cartId}/products/{productId}/quantity/{quantity}`
- **Quyền**: Public / Authenticated User
- **Response**: `CartDTO` cập nhật.

### 5.3. Cập nhật số lượng sản phẩm trong giỏ (Update Quantity)
- **Endpoint**: `PUT /api/public/carts/{cartId}/products/{productId}/quantity/{quantity}`
- **Quyền**: Public / Authenticated User
- **Response**: `CartDTO`.

### 5.4. Xóa sản phẩm khỏi giỏ hàng (Remove From Cart)
- **Endpoint**: `DELETE /api/public/carts/{cartId}/product/{productId}`
- **Quyền**: Public / Authenticated User
- **Response**: Trạng thái xóa.

### 5.5. Xem tất cả giỏ hàng (Get All Carts)
- **Endpoint**: `GET /api/admin/carts`
- **Quyền**: Admin
- **Response**: `List<CartDTO>`.

---

## 6. API Đặt hàng & Đơn hàng (Orders)

### 6.1. Tiến hành đặt hàng (Place Order)
- **Endpoint**: `POST /api/public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order`
- **Quyền**: Public / Authenticated User
- **Response**: `OrderDTO` mới được tạo (Status 201).

### 6.2. Xem lịch sử đơn hàng của User (Get Orders By User)
- **Endpoint**: `GET /api/public/users/{emailId}/orders`
- **Quyền**: Public / Authenticated User
- **Response**: `List<OrderDTO>`.

### 6.3. Chi tiết một đơn hàng của User (Get Order Detail)
- **Endpoint**: `GET /api/public/users/{emailId}/orders/{orderId}`
- **Quyền**: Public / Authenticated User
- **Response**: `OrderDTO`.

### 6.4. Xem toàn bộ đơn hàng của hệ thống (Get All Orders)
- **Endpoint**: `GET /api/admin/orders`
- **Params**: `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Admin
- **Response**: `OrderResponse`.

### 6.5. Cập nhật trạng thái đơn hàng (Update Order Status)
- **Endpoint**: `PUT /api/admin/users/{emailId}/orders/{orderId}/orderStatus/{orderStatus}`
- **Quyền**: Admin
- **Response**: `OrderDTO` cập nhật.

---

## 7. API Quản lý Người dùng (Users)

### 7.1. Lấy thông tin cá nhân (Get User By Email)
- **Endpoint**: `GET /api/public/users/email/{email}`
- **Quyền**: Public / Authenticated User
- **Response**: `UserDTO`.

### 7.2. Lấy thông tin User qua ID (Get User By ID)
- **Endpoint**: `GET /api/public/users/{userId}`
- **Quyền**: Public / Authenticated User
- **Response**: `UserDTO`.

### 7.3. Cập nhật thông tin User (Update User)
- **Endpoint**: `PUT /api/public/users/{userId}`
- **Quyền**: Public / Authenticated User
- **Request Body**: `UserDTO`
- **Response**: `UserDTO` đã cập nhật.

### 7.4. Lấy tất cả người dùng (Get All Users)
- **Endpoint**: `GET /api/admin/users`
- **Params**: `pageNumber`, `pageSize`, `sortBy`, `sortOrder`
- **Quyền**: Admin
- **Response**: `UserResponse`.

### 7.5. Xóa người dùng (Delete User)
- **Endpoint**: `DELETE /api/admin/users/{userId}`
- **Quyền**: Admin
- **Response**: Trạng thái xóa.

---

## 8. API Quản lý Địa chỉ (Addresses)

### 8.1. Thêm địa chỉ mới (Create Address)
- **Endpoint**: `POST /api/admin/address`
- **Quyền**: Admin *(Lưu ý: Route này hiện map vào `/api/admin`)*
- **Request Body**: `AddressDTO`
- **Response**: `AddressDTO`.

### 8.2. Lấy danh sách địa chỉ (Get Addresses)
- **Endpoint**: `GET /api/admin/addresses`
- **Quyền**: Admin
- **Response**: `List<AddressDTO>`.

### 8.3. Xem chi tiết / Cập nhật / Xoá địa chỉ
- **Get Detail**: `GET /api/admin/addresses/{addressId}`
- **Update**: `PUT /api/admin/addresses/{addressId}` (Request Body: `Address`)
- **Delete**: `DELETE /api/admin/addresses/{addressId}`

---

## 9. API Trí Tuệ Nhân Tạo (AI Support)

### 9.1. Hỏi đáp với AI (Ask AI)
- **Endpoint**: `POST /api/public/ai/ask`
- **Quyền**: Public
- **Request Body**: Nội dung câu hỏi (String Plain Text).
- **Response**: Câu trả lời từ hệ thống AI (String).

---
> [!TIP]
> - Các tham số về phân trang mặc định (nếu không truyền): `pageNumber` = 0, `pageSize` = 50 (tuỳ thuộc cấu hình AppcConstants).
> - Xử lý lỗi toàn cục (Global Exception Handler) sẽ trả lời dưới dạng JSON chi tiết báo cáo về validation thất bại, không tìm thấy dữ liệu (UserNotFound, ResourceNotFound, v.v).
