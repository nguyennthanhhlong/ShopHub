package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.entity.Category;
import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.entity.User;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.repository.CartRepo;
import com.nguyenthanhlong.shophub.repository.CategoryRepo;
import com.nguyenthanhlong.shophub.repository.OrderRepo;
import com.nguyenthanhlong.shophub.repository.ProductRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.repository.CouponRepo;
import com.nguyenthanhlong.shophub.entity.Coupon;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AIService {

        private final ChatClient chatClient;
        private final ProductRepo productRepo;
        private final CategoryRepo categoryRepo;
        private final OrderRepo orderRepo;
        private final UserRepo userRepo;
        private final CouponRepo couponRepo;

        @Autowired
        public AIService(ChatClient chatClient, ProductRepo productRepo, CategoryRepo categoryRepo, OrderRepo orderRepo,
                        UserRepo userRepo, CouponRepo couponRepo) {
                this.chatClient = chatClient;
                this.productRepo = productRepo;
                this.categoryRepo = categoryRepo;
                this.orderRepo = orderRepo;
                this.userRepo = userRepo;
                this.couponRepo = couponRepo;
        }

        public String answerCustomerQuestion(String question) {

                String keyword = extractKeywordFromQuestion(question);

                // 1. Lấy tất cả danh mục
                List<Category> allCategories = categoryRepo.findAll();
                StringBuilder categoryList = new StringBuilder("Danh sách danh mục:\n");
                for (Category c : allCategories) {
                        categoryList.append("- ").append(c.getCategoryName())
                                        .append(")\n");
                }

                // Lấy tất cả mã giảm giá
                List<Coupon> allCoupons = couponRepo.findAll();
                StringBuilder couponContext = new StringBuilder("Danh sách MÃ GIẢM GIÁ hiện có:\n");
                for (Coupon coupon : allCoupons) {
                        couponContext.append("- Mã: ").append(coupon.getCode())
                                     .append(" (Giảm ").append(coupon.getDiscountPercent()).append("%)\n");
                }

                // 2. Lấy danh sách sản phẩm (lấy tối đa 50 sản phẩm để AI có đủ context)
                org.springframework.data.domain.Page<Product> productPage = productRepo
                                .findAll(org.springframework.data.domain.PageRequest.of(0, 50));
                List<Product> products = productPage.getContent();

                // 3. Chuẩn bị context sản phẩm
                StringBuilder productContext = new StringBuilder("Thông tin tất cả sản phẩm hiện có:\n");
                for (Product p : products) {
                        String categoryName = (p.getCategory() != null)
                                        ? p.getCategory().getCategoryName()
                                        : "Chưa có danh mục";

                        productContext.append("- [Mã SP: ").append(p.getProductId()).append("] ")
                                        .append(p.getProductName())
                                        // .append(" (Giá đặc biệt: ").append(p.getSpecialPrice())
                                        .append(", Giá: ").append(p.getPrice())
                                        .append(", Danh mục: ").append(categoryName)
                                        .append(", Số lượng kho: ").append(p.getQuantity()).append(")\n")
                                        .append("Hình ảnh: ").append(p.getImage()).append("\n")
                                        .append("Mô tả: ").append(p.getProductDescription()).append("\n\n");
                }

                // 4. Tạo prompt tổng hợp
                String systemPrompt = "Bạn là trợ lý tư vấn bán hàng online thông minh của ShopHub.\n" +
                                "QUY TẮC QUAN TRỌNG NHẤT:\n" +
                                "1. Hãy trình bày nội dung bằng Markdown đẹp mắt (dùng bảng biểu để so sánh). ĐẶC BIỆT chú ý: với cột Hình ảnh trong bảng, BẮT BUỘC dùng cú pháp: ![Tên SP](I) trong đó I là link ảnh (image) của sản phẩm.\n"
                                +
                                "2. Khi khách hỏi xem sản phẩm hoặc danh mục, HÃY tư vấn bình thường và BẮT BUỘC thêm chuỗi JSON chứa các sản phẩm bạn vừa giới thiệu vào cuối câu trả lời:\n"
                                +
                                "@@PRODUCT_LIST_START@@[{\"productId\": X, \"productName\": \"Z\", \"price\": W, \"specialPrice\": V, \"image\": \"I\", \"description\": \"D\"}]@@PRODUCT_LIST_END@@\n"
                                +
                                "3. Khi khách muốn THÊM MỚI SẢN PHẨM VÀO GIỎ HÀNG/ĐẶT HÀNG, hãy xuất thẻ sau:\n" +
                                "@@ORDER_INTENT_START@@[{\"productId\": X, \"quantity\": Y, \"productName\": \"Z\", \"price\": W, \"specialPrice\": V, \"image\": \"I\"}]@@ORDER_INTENT_END@@\n"
                                +
                                "4. DỰA VÀO NGỮ CẢNH GIỎ HÀNG CỦA KHÁCH ĐƯỢC CUNG CẤP TRONG CÂU HỎI: Nếu khách YÊU CẦU thay đổi số lượng, xóa sản phẩm ĐÃ CÓ trong giỏ hàng, hãy xuất:\n"
                                +
                                "@@ACTION_CART_START@@[{\"action\": \"UPDATE\" hoặc \"REMOVE\", \"productId\": X, \"quantity\": Y}]@@ACTION_CART_END@@\n"
                                +
                                "5. KHI KHÁCH CHÊ ĐẮT HOẶC XIN GIẢM GIÁ: Hãy liệt kê các mã giảm giá hiện có để khách hàng chọn (không giới hạn phần trăm giảm). Nếu khách đồng ý, hãy xuất thẻ:\n"
                                +
                                "@@ACTION_COUPON_START@@{\"couponCode\": \"MÃ GIẢM GIÁ\"}@@ACTION_COUPON_END@@\n"
                                +
                                "6. KHI KHÁCH YÊU CẦU THANH TOÁN (Checkout): Hãy hỏi khách thanh toán bằng Tiền mặt (COD) hay VNPAY. NẾU KHÁCH ĐÃ CHỌN, hãy xuất thẻ:\n"
                                +
                                "@@ACTION_CHECKOUT_START@@{\"paymentMethod\": \"COD\" hoặc \"VNPAY\"}@@ACTION_CHECKOUT_END@@\n"
                                +
                                "Lưu ý: Không cần hỏi địa chỉ giao hàng. Hệ thống sẽ tự động dùng địa chỉ mặc định của khách. Bạn được cung cấp danh sách tất cả sản phẩm và MÃ GIẢM GIÁ ở bên dưới, hãy dựa vào đó để trả lời chính xác.";

                String userPrompt = String.format("%s\n\n%s\n\n%s\n\nCâu hỏi khách hàng: %s", categoryList, couponContext, productContext,
                                question);

                // 5. Gọi AI
                return chatClient
                                .prompt()
                                .system(systemPrompt)
                                .user(userPrompt)
                                .call()
                                .content();
        }

        private String extractKeywordFromQuestion(String question) {
                // Cách đơn giản: lấy các từ quan trọng, hoặc regex
                // Ở đây dùng tạm: lấy từ đầu tiên > 2 ký tự
                return Arrays.stream(question.split("\\s+"))
                                .filter(w -> w.length() > 2)
                                .findFirst()
                                .orElse("");
        }
}
