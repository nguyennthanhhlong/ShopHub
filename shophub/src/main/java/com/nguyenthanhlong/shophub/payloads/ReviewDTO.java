package com.nguyenthanhlong.shophub.payloads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long reviewId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    // User info
    private String userEmail;
    private String userName; // Combine firstName and lastName
    private String userImage;

    private Long productId;
}
