package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByProduct_ProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByUser_Email(String email);

    boolean existsByUser_EmailAndProduct_ProductId(String email, Long productId);
}
