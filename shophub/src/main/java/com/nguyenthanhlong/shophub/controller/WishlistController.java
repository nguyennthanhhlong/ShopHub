package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import com.nguyenthanhlong.shophub.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // GET /api/user/wishlist
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getUserWishlist(@RequestParam String email) {
        List<ProductDTO> wishlists = wishlistService.getUserWishlist(email);
        return new ResponseEntity<>(wishlists, HttpStatus.OK);
    }

    // GET /api/user/wishlist/product-ids
    @GetMapping("/product-ids")
    public ResponseEntity<List<Long>> getUserWishlistProductIds(@RequestParam String email) {
        List<Long> productIds = wishlistService.getUserWishlistProductIds(email);
        return new ResponseEntity<>(productIds, HttpStatus.OK);
    }

    // POST /api/user/wishlist/add/{productId}
    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addProductToWishlist(@PathVariable Long productId, @RequestParam String email) {
        wishlistService.addProductToWishlist(email, productId);
        return new ResponseEntity<>("Product added to wishlist successfully", HttpStatus.CREATED);
    }

    // DELETE /api/user/wishlist/remove/{productId}
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<String> removeProductFromWishlist(@PathVariable Long productId, @RequestParam String email) {
        wishlistService.removeProductFromWishlist(email, productId);
        return new ResponseEntity<>("Product removed from wishlist successfully", HttpStatus.OK);
    }
}
