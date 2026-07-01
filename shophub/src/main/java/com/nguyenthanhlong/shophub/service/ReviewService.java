package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.payloads.ReviewDTO;
import com.nguyenthanhlong.shophub.payloads.ReviewRequest;

import java.util.List;

public interface ReviewService {
    ReviewDTO addReview(Long productId, String email, ReviewRequest reviewRequest);

    List<ReviewDTO> getReviewsByProduct(Long productId);

    List<ReviewDTO> getAllReviews();

    void deleteReview(Long reviewId);
}
