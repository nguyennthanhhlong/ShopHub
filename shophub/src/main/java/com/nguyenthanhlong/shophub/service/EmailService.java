package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.payloads.OrderDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmationEmail(String toEmail, OrderDTO orderDTO) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng #" + orderDTO.getOrderId() + " từ ShopHub");

            String htmlContent = buildEmailContent(orderDTO);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + toEmail);
            e.printStackTrace();
        }
    }

    private String buildEmailContent(OrderDTO orderDTO) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>");
        sb.append("<h2 style='color: #4CAF50; text-align: center;'>Cảm ơn bạn đã mua sắm tại ShopHub!</h2>");
        sb.append("<p>Chào bạn,</p>");
        sb.append("<p>Đơn hàng <strong>#").append(orderDTO.getOrderId())
                .append("</strong> của bạn đã được tiếp nhận và đang trong quá trình xử lý.</p>");

        sb.append("<h3 style='border-bottom: 1px solid #eee; padding-bottom: 5px;'>Thông tin đơn hàng</h3>");
        sb.append("<ul>");
        sb.append("<li><strong>Mã đơn hàng:</strong> ").append(orderDTO.getOrderId()).append("</li>");
        sb.append("<li><strong>Ngày đặt:</strong> ").append(orderDTO.getOrderDate()).append("</li>");
        sb.append("<li><strong>Tổng tiền:</strong> <span style='color: #E53935; font-weight: bold;'>$")
                .append(orderDTO.getTotalAmount()).append("</span></li>");
        sb.append("<li><strong>Trạng thái:</strong> ").append(orderDTO.getOrderStatus()).append("</li>");
        sb.append("</ul>");

        sb.append("<h3>Danh sách sản phẩm</h3>");
        sb.append("<table style='width: 100%; border-collapse: collapse;'>");
        sb.append(
                "<tr style='background-color: #f9f9f9;'><th style='padding: 8px; border: 1px solid #ddd;'>Sản phẩm</th><th style='padding: 8px; border: 1px solid #ddd;'>Giá</th></tr>");

        if (orderDTO.getOrderItems() != null) {
            orderDTO.getOrderItems().forEach(item -> {
                sb.append("<tr>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd;'>")
                        .append(item.getProduct().getProductName()).append(" (x").append(item.getQuantity())
                        .append(")</td>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd;'>$")
                        .append(item.getOrderedProductPrice() * item.getQuantity()).append("</td>");
                sb.append("</tr>");
            });
        }

        sb.append("</table>");

        sb.append("<p style='margin-top: 20px;'>Mọi thắc mắc vui lòng liên hệ email hỗ trợ của chúng tôi.</p>");
        sb.append("<p>Trân trọng,<br/><strong>Đội ngũ ShopHub</strong></p>");
        sb.append("</div>");

        return sb.toString();
    }

    public void sendPasswordResetEmail(String toEmail, String newPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Khôi phục mật khẩu từ ShopHub");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                    "<h2 style='color: #4CAF50; text-align: center;'>Khôi phục mật khẩu ShopHub</h2>" +
                    "<p>Chào bạn,</p>" +
                    "<p>Mật khẩu mới của bạn là: <strong>" + newPassword + "</strong></p>" +
                    "<p>Vui lòng đăng nhập và đổi mật khẩu để đảm bảo an toàn.</p>" +
                    "<p>Trân trọng,<br/><strong>Đội ngũ ShopHub</strong></p>" +
                    "</div>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Email reset password sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send reset password email to: " + toEmail);
            e.printStackTrace();
        }
    }
}

