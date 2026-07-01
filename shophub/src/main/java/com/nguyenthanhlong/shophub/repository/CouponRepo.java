package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepo extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findFirstByCode(String code);
}
