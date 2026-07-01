package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.entity.User;
import com.nguyenthanhlong.shophub.entity.Wishlist;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import com.nguyenthanhlong.shophub.repository.ProductRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.repository.WishlistRepo;
import com.nguyenthanhlong.shophub.service.WishlistService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepo wishlistRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final ModelMapper modelMapper;

    public WishlistServiceImpl(WishlistRepo wishlistRepo, UserRepo userRepo, ProductRepo productRepo,
            ModelMapper modelMapper) {
        this.wishlistRepo = wishlistRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public void addProductToWishlist(String email, Long productId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNofFoundException("User", "email", email));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        if (wishlistRepo.existsByUser_EmailAndProduct_ProductId(email, productId)) {
            throw new APIException("Product is already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlist.setCreatedAt(LocalDateTime.now());
        wishlistRepo.save(wishlist);
    }

    @Override
    public void removeProductFromWishlist(String email, Long productId) {
        if (!wishlistRepo.existsByUser_EmailAndProduct_ProductId(email, productId)) {
            throw new ResourceNofFoundException("Wishlist Item", "productId", productId);
        }
        wishlistRepo.deleteByUser_EmailAndProduct_ProductId(email, productId);
    }

    @Override
    public List<ProductDTO> getUserWishlist(String email) {
        List<Wishlist> wishlists = wishlistRepo.findByUser_EmailOrderByCreatedAtDesc(email);

        return wishlists.stream()
                .map(wishlist -> {
                    ProductDTO dto = modelMapper.map(wishlist.getProduct(), ProductDTO.class);
                    // Handle special price if null
                    dto.setSpecialPrice(
                            wishlist.getProduct().getSpecialPrice() != null ? wishlist.getProduct().getSpecialPrice()
                                    : 0.0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getUserWishlistProductIds(String email) {
        List<Wishlist> wishlists = wishlistRepo.findByUser_EmailOrderByCreatedAtDesc(email);
        return wishlists.stream()
                .map(wishlist -> wishlist.getProduct().getProductId())
                .collect(Collectors.toList());
    }
}
