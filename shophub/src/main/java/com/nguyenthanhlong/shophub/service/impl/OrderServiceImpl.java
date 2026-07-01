package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Cart;
import com.nguyenthanhlong.shophub.entity.CartItem;
import com.nguyenthanhlong.shophub.entity.Order;
import com.nguyenthanhlong.shophub.entity.OrderItem;
import com.nguyenthanhlong.shophub.entity.Payment;
import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.OrderDTO;
import com.nguyenthanhlong.shophub.payloads.OrderItemDTO;
import com.nguyenthanhlong.shophub.payloads.OrderResponse;
import com.nguyenthanhlong.shophub.repository.CartItemRepo;
import com.nguyenthanhlong.shophub.repository.CartRepo;
import com.nguyenthanhlong.shophub.repository.OrderItemRepo;
import com.nguyenthanhlong.shophub.repository.OrderRepo;
import com.nguyenthanhlong.shophub.repository.PaymentRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.service.CartService;
import com.nguyenthanhlong.shophub.service.CouponService;
import com.nguyenthanhlong.shophub.service.EmailService;
import com.nguyenthanhlong.shophub.service.OrderService;
import com.nguyenthanhlong.shophub.service.UserService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Transactional
@Service
public class OrderServiceImpl implements OrderService {
    private UserRepo userRepo;
    private CartRepo cartRepo;
    private OrderRepo orderRepo;
    private PaymentRepo paymentRepo;
    private OrderItemRepo orderItemRepo;
    private CartItemRepo cartItemRepo;
    private UserService userService;
    private CartService cartService;
    private ModelMapper modelMapper;
    private EmailService emailService;
    private CouponService couponService;

    public OrderServiceImpl(UserRepo userRepo, CartRepo cartRepo, OrderRepo orderRepo, PaymentRepo paymentRepo,
            OrderItemRepo orderItemRepo, CartItemRepo cartItemRepo, UserService userService, CartService cartService,
            ModelMapper modelMapper, EmailService emailService, CouponService couponService) {
        this.userRepo = userRepo;
        this.cartRepo = cartRepo;
        this.orderRepo = orderRepo;
        this.paymentRepo = paymentRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartItemRepo = cartItemRepo;
        this.userService = userService;
        this.cartService = cartService;
        this.modelMapper = modelMapper;
        this.emailService = emailService;
        this.couponService = couponService;
    }

    @Override
    public OrderDTO placeOrder(String email, Long cartId, String paymentMethod, String couponCode) {
        Cart cart = cartRepo.findCartByEmailAndCartId(email, cartId);

        if (cart == null) {
            throw new ResourceNofFoundException("Cart", "Cart Id", cartId);
        }

        Order order = new Order();

        order.setEmail(email);
        order.setOrderDate(LocalDate.now());

        double totalAmount = cart.getTotalPrice();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            try {
                var coupon = couponService.validateCoupon(couponCode);
                double discount = totalAmount * (coupon.getDiscountPercent() / 100.0);
                totalAmount = totalAmount - discount;
            } catch (Exception e) {
                System.err.println("Invalid coupon code applied during checkout: " + couponCode);
            }
        }
        order.setTotalAmount(totalAmount);

        if ("vnpay".equalsIgnoreCase(paymentMethod)) {
            order.setOrderStatus("Pending Payment");
        } else {
            order.setOrderStatus("Order Accepted");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);

        payment = paymentRepo.save(payment);

        order.setPayment(payment);

        Order savedOrder = orderRepo.save(order);

        List<CartItem> cartItems = cart.getCartItems();

        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);

            orderItems.add(orderItem);
        }

        orderItems = orderItemRepo.saveAll(orderItems);

        cart.getCartItems().forEach(item -> {
            int quantity = item.getQuantity();

            Product product = item.getProduct();

            cartService.deleteProductFromCart(cartId, item.getProduct().getProductId());

            product.setQuantity(product.getQuantity() - quantity);
        });

        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);

        orderItems.forEach(item -> {
            ;
            orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class));
        });

        if (!"vnpay".equalsIgnoreCase(paymentMethod)) {
            // Send confirmation email asynchronously (or simply inline here)
            emailService.sendOrderConfirmationEmail(email, orderDTO);
        }

        return orderDTO;
    }

    @Override
    public OrderDTO getOrder(String emailId, Long orderId) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);

        if (order == null) {
            throw new ResourceNofFoundException("Order", "Order Id", orderId);
        }

        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    public List<OrderDTO> getOrdersByUser(String emailId) {
        List<Order> orders = orderRepo.findAllByEmail(emailId);

        List<OrderDTO> orderDTOS = orders.stream().map(order -> modelMapper.map(order, OrderDTO.class)).toList();

        if (orderDTOS.isEmpty()) {
            throw new APIException("No orders placed yet by the user with email: " + emailId);
        }

        return orderDTOS;
    }

    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Order> pageOrders = orderRepo.findAll(pageDetails);

        List<Order> orders = pageOrders.getContent();

        List<OrderDTO> orderDTOS = orders.stream().map(order -> modelMapper.map(order, OrderDTO.class)).toList();

        // if (orderDTOS.isEmpty()) {
        //     throw new APIException("No orders placed yet by any user");
        // }

        OrderResponse orderResponse = new OrderResponse();

        orderResponse.setContent(orderDTOS);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());

        return orderResponse;
    }

    @Override
    public OrderResponse searchOrder(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Order> pageOrders = orderRepo.findByEmailContainingIgnoreCase(keyword, pageDetails);

        List<Order> orders = pageOrders.getContent();

        List<OrderDTO> orderDTOS = orders.stream().map(order -> modelMapper.map(order, OrderDTO.class)).toList();

        OrderResponse orderResponse = new OrderResponse();

        orderResponse.setContent(orderDTOS);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());

        return orderResponse;
    }

    @Override
    public OrderDTO updateOrder(String emailId, Long orderId, String orderStatus) {
        Order order = orderRepo.findOrderByEmailAndOrderId(emailId, orderId);

        if (order == null) {
            throw new ResourceNofFoundException("Order", "Order Id", orderId);
        }

        order.setOrderStatus(orderStatus);
        return modelMapper.map(order, OrderDTO.class);
    }
}
