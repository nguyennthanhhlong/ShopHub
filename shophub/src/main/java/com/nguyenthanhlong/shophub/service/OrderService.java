package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.payloads.OrderDTO;
import com.nguyenthanhlong.shophub.payloads.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod, String couponCode);

    OrderDTO getOrder(String emailId, Long orderId);

    List<OrderDTO> getOrdersByUser(String emailId);

    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderResponse searchOrder(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderDTO updateOrder(String emailId, Long orderId, String orderStatus);
}
