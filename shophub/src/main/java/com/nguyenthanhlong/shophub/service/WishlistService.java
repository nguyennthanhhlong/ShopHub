package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.payloads.ProductDTO;

import java.util.List;

public interface WishlistService {
    void addProductToWishlist(String email, Long productId);

    void removeProductFromWishlist(String email, Long productId);

    List<ProductDTO> getUserWishlist(String email);

    List<Long> getUserWishlistProductIds(String email);
}
