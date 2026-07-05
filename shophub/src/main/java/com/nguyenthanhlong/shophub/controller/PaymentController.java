package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.config.VNPAYConfig;
import com.nguyenthanhlong.shophub.entity.Order;
import com.nguyenthanhlong.shophub.payloads.OrderDTO;
import com.nguyenthanhlong.shophub.repository.OrderRepo;
import com.nguyenthanhlong.shophub.service.EmailService;
import com.nguyenthanhlong.shophub.service.OrderService;
import com.nguyenthanhlong.shophub.service.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/public/payment")
public class PaymentController {

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendBaseUrl;

    private final VNPAYService vnpayService;
    private final OrderRepo orderRepo;
    private final OrderService orderService;
    private final EmailService emailService;

    public PaymentController(VNPAYService vnpayService, OrderRepo orderRepo, OrderService orderService,
            EmailService emailService) {
        this.vnpayService = vnpayService;
        this.orderRepo = orderRepo;
        this.orderService = orderService;
        this.emailService = emailService;
    }

    @GetMapping("/create_vnpay")
    public ResponseEntity<?> createPayment(
            @RequestParam Long orderId,
            HttpServletRequest request) {

        Order order = orderRepo.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.badRequest().body("Order not found");
        }

        String ipAddress = VNPAYConfig.getIpAddress(request);
        String paymentUrl = vnpayService.createPaymentUrl(order.getOrderId(), order.getTotalAmount(), ipAddress);

        Map<String, String> response = new HashMap<>();
        response.put("url", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay_return")
    public RedirectView vnpayReturn(@RequestParam Map<String, String> params) {
        String frontendUrl = frontendBaseUrl + "/site/vnpay-return";

        try {
            boolean isValid = vnpayService.verifyPayment(params);
            if (isValid) {
                String responseCode = params.get("vnp_ResponseCode");
                String orderIdStr = params.get("vnp_TxnRef");
                Long orderId = Long.parseLong(orderIdStr);

                Order order = orderRepo.findById(orderId).orElse(null);

                if ("00".equals(responseCode)) {
                    // Payment Success
                    if (order != null) {
                        order.setOrderStatus("Pending");
                        orderRepo.save(order);

                        // Send email now
                        OrderDTO orderDTO = orderService.getOrder(order.getEmail(), order.getOrderId());
                        emailService.sendOrderConfirmationEmail(order.getEmail(), orderDTO);
                    }
                    return new RedirectView(frontendUrl + "?status=success&orderId=" + orderId);
                } else {
                    // Payment Failed
                    if (order != null) {
                        order.setOrderStatus("Payment Failed");
                        orderRepo.save(order);
                    }
                    return new RedirectView(frontendUrl + "?status=failed&orderId=" + orderId);
                }
            } else {
                return new RedirectView(frontendUrl + "?status=invalid_signature");
            }
        } catch (Exception e) {
            return new RedirectView(frontendUrl + "?status=error");
        }
    }
}
