package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.payloads.ReviewDTO;
import com.nguyenthanhlong.shophub.payloads.ReviewRequest;
import com.nguyenthanhlong.shophub.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /api/public/products/{productId}/reviews
    @GetMapping("/public/products/{productId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProduct(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByProduct(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // POST /api/user/products/{productId}/reviews
    // Requires Authentication
    @PostMapping("/user/products/{productId}/reviews")
    public ResponseEntity<ReviewDTO> addReview(@PathVariable Long productId,
            @RequestParam String email,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        ReviewDTO reviewDTO = reviewService.addReview(productId, email, reviewRequest);
        return new ResponseEntity<>(reviewDTO, HttpStatus.CREATED);
    }

    // GET /api/admin/reviews
    // Admin: Get all reviews
    @GetMapping("/admin/reviews")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<ReviewDTO> reviews = reviewService.getAllReviews();
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // DELETE /api/admin/reviews/{reviewId}
    // Admin: Delete a review
    @DeleteMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return new ResponseEntity<>("Review deleted successfully.", HttpStatus.OK);
    }
}
