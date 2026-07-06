package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Coupon;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.repository.CouponRepo;
import com.nguyenthanhlong.shophub.service.CouponService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepo couponRepo;

    public CouponServiceImpl(CouponRepo couponRepo) {
        this.couponRepo = couponRepo;
    }

    // Tự động tạo một vài mã giảm giá mẫu nếu chưa có
    @PostConstruct
    public void initCoupons() {
        if (couponRepo.count() == 0) {
            couponRepo.save(new Coupon(null, "SALE20", 20.0, true, LocalDateTime.now().plusDays(30)));
            couponRepo.save(new Coupon(null, "WELCOME10", 10.0, true, LocalDateTime.now().plusDays(365)));
            couponRepo.save(new Coupon(null, "HALFSALE", 50.0, true, LocalDateTime.now().plusDays(7)));
        }
    }

    @Override
    public Coupon validateCoupon(String code) {
        Optional<Coupon> optionalCoupon = couponRepo.findFirstByCode(code.toUpperCase());

        if (optionalCoupon.isEmpty()) {
            throw new ResourceNofFoundException("Coupon", "code", code);
        }

        Coupon coupon = optionalCoupon.get();

        if (!coupon.getIsActive()) {
            throw new APIException("Mã giảm giá này đã ngừng hoạt động.");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new APIException("Mã giảm giá này đã hết hạn.");
        }

        return coupon;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepo.findAll();
    }

    @Override
    public List<Coupon> getActiveCoupons() {
        return couponRepo.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()) && 
                        (c.getExpiryDate() == null || c.getExpiryDate().isAfter(LocalDateTime.now())))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Coupon createCoupon(Coupon coupon) {
        if (coupon.getCode() != null) {
            coupon.setCode(coupon.getCode().toUpperCase());
            Optional<Coupon> existing = couponRepo.findFirstByCode(coupon.getCode());
            if (existing.isPresent()) {
                throw new APIException("Mã giảm giá " + coupon.getCode() + " đã tồn tại.");
            }
        }
        if (coupon.getIsActive() == null) {
            coupon.setIsActive(true);
        }
        return couponRepo.save(coupon);
    }

    @Override
    public Coupon updateCoupon(Long id, Coupon coupon) {
        Coupon existingCoupon = couponRepo.findById(id)
                .orElseThrow(() -> new ResourceNofFoundException("Coupon", "id", id.toString()));

        if (coupon.getCode() != null) {
            String newCode = coupon.getCode().toUpperCase();
            if (!existingCoupon.getCode().equals(newCode)) {
                Optional<Coupon> duplicate = couponRepo.findFirstByCode(newCode);
                if (duplicate.isPresent()) {
                    throw new APIException("Mã giảm giá " + newCode + " đã tồn tại.");
                }
            }
            existingCoupon.setCode(newCode);
        }
        if (coupon.getDiscountPercent() != null) {
            existingCoupon.setDiscountPercent(coupon.getDiscountPercent());
        }
        if (coupon.getIsActive() != null) {
            existingCoupon.setIsActive(coupon.getIsActive());
        }
        if (coupon.getExpiryDate() != null) {
            existingCoupon.setExpiryDate(coupon.getExpiryDate());
        }

        return couponRepo.save(existingCoupon);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon existingCoupon = couponRepo.findById(id)
                .orElseThrow(() -> new ResourceNofFoundException("Coupon", "id", id.toString()));
        couponRepo.delete(existingCoupon);
    }
}
