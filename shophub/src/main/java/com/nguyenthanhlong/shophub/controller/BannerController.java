package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.entity.Banner;
import com.nguyenthanhlong.shophub.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BannerController {

    private final BannerService bannerService;

    @Autowired
    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    // Public Endpoint
    @GetMapping("/public/banners/section/{section}")
    public ResponseEntity<List<Banner>> getBannersBySection(@PathVariable String section) {
        return ResponseEntity.ok(bannerService.getBannersBySection(section));
    }

    // Admin Endpoints
    @GetMapping("/admin/banners")
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/admin/banners/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.getBannerById(id));
    }

    @PostMapping("/admin/banners")
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        return new ResponseEntity<>(bannerService.createBanner(banner), HttpStatus.CREATED);
    }

    @PutMapping("/admin/banners/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/admin/banners/{id}")
    public ResponseEntity<String> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok("Banner deleted successfully");
    }
}
