package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepo extends JpaRepository<Payment, Long> {
}
