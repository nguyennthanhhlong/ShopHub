package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.config.AppcConstants;
import com.nguyenthanhlong.shophub.payloads.OrderDTO;
import com.nguyenthanhlong.shophub.payloads.OrderResponse;
import com.nguyenthanhlong.shophub.service.OrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order")
    public ResponseEntity<OrderDTO> orderProducts(@PathVariable String emailId,
            @PathVariable Long cartId,
            @PathVariable String paymentMethod,
            @RequestParam(required = false) String couponCode) {
        OrderDTO orderDTO = this.orderService.placeOrder(emailId, cartId, paymentMethod, couponCode);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<OrderResponse> getAllOrders(
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_ORDERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        OrderResponse orderResponse = orderService.getAllOrders(pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/orders/search/{keyword}")
    public ResponseEntity<OrderResponse> searchOrdersByKeyword(
            @PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_ORDERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        OrderResponse orderResponse = orderService.searchOrder(keyword, pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @GetMapping("/public/users/{emailId}/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable String emailId) {
        List<OrderDTO> orders = orderService.getOrdersByUser(emailId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @GetMapping("/public/users/{emailId}/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByIdAndUser(@PathVariable String emailId,
            @PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrder(emailId, orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PutMapping("/admin/users/{emailId}/orders/{orderId}/orderStatus/{orderStatus}")
    public ResponseEntity<OrderDTO> updateOrderStatusByAdmin(@PathVariable String emailId,
            @PathVariable Long orderId,
            @PathVariable String orderStatus) {
        OrderDTO updatedOrder = orderService.updateOrder(emailId, orderId, orderStatus);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }
}
