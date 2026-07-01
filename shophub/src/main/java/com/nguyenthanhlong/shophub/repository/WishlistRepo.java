package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepo extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser_EmailOrderByCreatedAtDesc(String email);

    Optional<Wishlist> findByUser_EmailAndProduct_ProductId(String email, Long productId);

    boolean existsByUser_EmailAndProduct_ProductId(String email, Long productId);

    void deleteByUser_EmailAndProduct_ProductId(String email, Long productId);
}
