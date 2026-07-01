package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.entity.Coupon;
import com.nguyenthanhlong.shophub.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/public/coupons/{code}")
    public ResponseEntity<Coupon> validateCoupon(@PathVariable String code) {
        Coupon coupon = couponService.validateCoupon(code);
        return new ResponseEntity<>(coupon, HttpStatus.OK);
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        return new ResponseEntity<>(coupons, HttpStatus.OK);
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        Coupon saved = couponService.createCoupon(coupon);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/admin/coupons/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        Coupon updated = couponService.updateCoupon(id, coupon);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<String> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return new ResponseEntity<>("Coupon deleted successfully", HttpStatus.OK);
    }
}
