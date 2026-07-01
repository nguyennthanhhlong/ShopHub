# ShopHub - Backend API Documentation

Hệ thống cung cấp một loạt các API RESTful chuyên nghiệp cho E-commerce, bao gồm quản lý người dùng, sản phẩm, giỏ hàng, đơn hàng, thanh toán VNPAY, mã giảm giá và tích hợp AI thông minh.

Tất cả các API dưới đây có **Base URL** là: `http://localhost:8080/api`

---

## 🔐 1. Authentication (Xác thực) & User Management (Người dùng)
**Controller**: `AuthController`, `UserController`

### Authentication (Public)
- `POST /register` - Đăng ký tài khoản mới.
- `POST /login` - Đăng nhập (trả về JWT token).

### Người dùng (Public)
- `GET /public/users/{userId}` - Lấy thông tin người dùng theo ID.
- `GET /public/users/email/{email}` - Lấy thông tin người dùng theo Email.
- `PUT /public/users/{userId}` - Cập nhật thông tin cá nhân.
- `POST /public/users/forgot-password` - Yêu cầu đổi mật khẩu (Quên mật khẩu).
- `PUT /public/users/change-password` - Thay đổi mật khẩu mới.

### Admin Users (Admin)
- `GET /admin/users` - Danh sách tất cả tài khoản.
- `GET /admin/users/search/{keyword}` - Tìm kiếm tài khoản.
- `DELETE /admin/users/{userId}` - Xóa tài khoản người dùng.

---

## 📦 2. Product Management (Sản phẩm)
**Controller**: `ProductController`

### Public APIs
- `GET /public/products` - Lấy danh sách tất cả sản phẩm.
- `GET /public/products/top` - Lấy top sản phẩm bán chạy/nổi bật.
- `GET /public/products/{productId}` - Xem chi tiết 1 sản phẩm.
- `GET /public/products/keyword/{keyword}` - Tìm kiếm sản phẩm.
- `GET /public/products/image/{fileName}` - Xem ảnh sản phẩm.
- `GET /public/categories/{categoryId}/products` - Xem sản phẩm theo danh mục.

### Admin APIs
- `POST /admin/categories/{categoryId}/products` - Thêm sản phẩm mới vào danh mục.
- `PUT /admin/products/{productId}` - Cập nhật thông tin sản phẩm.
- `PUT /admin/products/{productId}/image` - Cập nhật hình ảnh sản phẩm.
- `DELETE /admin/products/{productId}` - Xóa sản phẩm.

---

## 📂 3. Category Management (Danh mục)
**Controller**: `CategoryController`

### Public APIs
- `GET /public/categories` - Danh sách tất cả danh mục.
- `GET /public/categories/{categoryId}` - Chi tiết danh mục.
- `GET /public/categories/keyword/{keyword}` - Tìm kiếm danh mục.

### Admin APIs
- `POST /admin/categories` - Tạo danh mục mới.
- `PUT /admin/categories/{categoryId}` - Cập nhật danh mục.
- `DELETE /admin/categories/{categoryId}` - Xóa danh mục.

---

## 🛒 4. Cart Management (Giỏ hàng)
**Controller**: `CartController`

### Public APIs (Yêu cầu Token)
- `GET /public/users/{emailId}/carts/{cartId}` - Xem giỏ hàng cá nhân.
- `POST /public/carts/{cartId}/products/{productId}/quantity/{quantity}` - Thêm sản phẩm vào giỏ hàng.
- `PUT /public/carts/{cartId}/products/{productId}/quantity/{quantity}` - Cập nhật số lượng sản phẩm.
- `DELETE /public/carts/{cartId}/product/{productId}` - Xóa 1 sản phẩm khỏi giỏ hàng.

### Admin APIs
- `GET /admin/carts` - Xem tất cả giỏ hàng (Admin).

---

## 🧾 5. Order & Checkout (Đơn hàng)
**Controller**: `OrderController`

### Public APIs (Yêu cầu Token)
- `POST /public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order` - Tiến hành thanh toán và đặt hàng (Hỗ trợ query param `?couponCode=...`).
- `GET /public/users/{emailId}/orders` - Xem lịch sử đơn hàng của người dùng.
- `GET /public/users/{emailId}/orders/{orderId}` - Xem chi tiết đơn hàng.

### Admin APIs
- `GET /admin/orders` - Danh sách tất cả đơn hàng.
- `GET /admin/orders/search/{keyword}` - Tìm kiếm đơn hàng.
- `PUT /admin/users/{emailId}/orders/{orderId}/orderStatus/{orderStatus}` - Cập nhật trạng thái đơn hàng (Processing, Shipped, Delivered...).

---

## 💳 6. Payment Integration (Thanh toán VNPAY)
**Controller**: `PaymentController`
*(Base Route: `/api/public/payment`)*

- `GET /create_vnpay` - Tạo URL thanh toán VNPAY (truyền theo `orderId` và tổng tiền).
- `GET /vnpay_return` - Callback xử lý kết quả thanh toán từ VNPAY.

---

## 🏷️ 7. Coupon Management (Mã giảm giá)
**Controller**: `CouponController`

### Public APIs
- `GET /public/coupons/{code}` - Xác thực mã giảm giá (Lấy % giảm giá).

### Admin APIs
- `GET /admin/coupons` - Danh sách toàn bộ mã.
- `POST /admin/coupons` - Tạo mã mới.
- `PUT /admin/coupons/{id}` - Chỉnh sửa mã giảm giá.
- `DELETE /admin/coupons/{id}` - Xóa mã giảm giá.

---

## 🤖 8. AI Chatbot Integration (Trợ lý AI)
**Controller**: `AIController`

- `POST /public/ai/ask` - Gửi câu hỏi đến Trợ lý AI. Có khả năng tự động xử lý giỏ hàng, nhận dạng ngữ cảnh sản phẩm, phân tích thanh toán và đề xuất Coupon tự động.

---

## ❤️ 9. Wishlist (Sản phẩm yêu thích)
**Controller**: `WishlistController`
*(Base Route: `/api/user/wishlist`)*

- `GET /` - Danh sách yêu thích của người dùng.
- `GET /product-ids` - Lấy mảng ID sản phẩm đã thích.
- `POST /add/{productId}` - Thêm vào danh sách yêu thích.
- `DELETE /remove/{productId}` - Xóa khỏi danh sách yêu thích.

---

## 🌟 10. Reviews & Testimonials (Đánh giá)
**Controller**: `ReviewController`, `TestimonialController`

### Reviews (Đánh giá Sản phẩm)
- `GET /public/products/{productId}/reviews` - Xem nhận xét của một sản phẩm.
- `POST /user/products/{productId}/reviews` - Thêm nhận xét mới (Yêu cầu đăng nhập).

### Testimonials (Đánh giá Hệ thống)
- `GET /public/testimonials` - Danh sách nhận xét nổi bật.
- `GET /admin/testimonials` - (Admin) Quản lý tất cả nhận xét.
- `GET /admin/testimonials/{id}` - Lấy 1 nhận xét.
- `POST /admin/testimonials` - Tạo mới.
- `PUT /admin/testimonials/{id}` - Cập nhật.
- `DELETE /admin/testimonials/{id}` - Xóa nhận xét.

---

## 🖼️ 11. Banners (Quảng cáo)
**Controller**: `BannerController`

### Public APIs
- `GET /public/banners/section/{section}` - Lấy Banner theo khu vực (Hero, Sidebar...).

### Admin APIs
- `GET /admin/banners` - Liệt kê tất cả Banners.
- `GET /admin/banners/{id}` - Chi tiết 1 Banner.
- `POST /admin/banners` - Thêm mới.
- `PUT /admin/banners/{id}` - Cập nhật Banner.
- `DELETE /admin/banners/{id}` - Xóa Banner.

---

## 📍 12. Address Management (Địa chỉ)
**Controller**: `AddressController`
*(Base Route: `/api/admin`)*

- `POST /address` - Tạo địa chỉ mới.
- `GET /addresses` - Danh sách địa chỉ.
- `GET /addresses/{addressId}` - Xem địa chỉ.
- `PUT /addresses/{addressId}` - Cập nhật.
- `DELETE /addresses/{addressId}` - Xóa địa chỉ.
