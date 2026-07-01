package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.entity.Review;
import com.nguyenthanhlong.shophub.entity.User;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.ReviewDTO;
import com.nguyenthanhlong.shophub.payloads.ReviewRequest;
import com.nguyenthanhlong.shophub.repository.ProductRepo;
import com.nguyenthanhlong.shophub.repository.ReviewRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.service.ReviewService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepo reviewRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;

    public ReviewServiceImpl(ReviewRepo reviewRepo, ProductRepo productRepo, UserRepo userRepo) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    @Override
    public ReviewDTO addReview(Long productId, String email, ReviewRequest reviewRequest) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNofFoundException("User", "email", email));

        // Check if user already reviewed this product
        if (reviewRepo.existsByUser_EmailAndProduct_ProductId(email, productId)) {
            throw new APIException("You have already reviewed this product.");
        }

        Review review = new Review();
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setProduct(product);
        review.setUser(user);

        Review savedReview = reviewRepo.save(review);
        return mapToDTO(savedReview);
    }

    @Override
    public List<ReviewDTO> getReviewsByProduct(Long productId) {
        // Validate product exists
        productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        List<Review> reviews = reviewRepo.findByProduct_ProductIdOrderByCreatedAtDesc(productId);

        return reviews.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getAllReviews() {
        List<Review> reviews = reviewRepo.findAll();
        return reviews.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new ResourceNofFoundException("Review", "reviewId", reviewId));
        reviewRepo.delete(review);
    }

    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setProductId(review.getProduct().getProductId());

        if (review.getUser() != null) {
            dto.setUserEmail(review.getUser().getEmail());
            String firstName = review.getUser().getFirstName() != null ? review.getUser().getFirstName() : "";
            String lastName = review.getUser().getLastName() != null ? review.getUser().getLastName() : "";
            dto.setUserName((firstName + " " + lastName).trim());
        }
        return dto;
    }
}
