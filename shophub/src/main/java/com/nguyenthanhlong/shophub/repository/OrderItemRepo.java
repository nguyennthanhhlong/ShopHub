package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
}
