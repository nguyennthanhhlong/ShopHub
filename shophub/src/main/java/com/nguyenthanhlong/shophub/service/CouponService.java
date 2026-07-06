package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.entity.Coupon;
import java.util.List;

public interface CouponService {
    Coupon validateCoupon(String code);

    List<Coupon> getAllCoupons();

    List<Coupon> getActiveCoupons();

    Coupon createCoupon(Coupon coupon);

    Coupon updateCoupon(Long id, Coupon coupon);

    void deleteCoupon(Long id);
}
