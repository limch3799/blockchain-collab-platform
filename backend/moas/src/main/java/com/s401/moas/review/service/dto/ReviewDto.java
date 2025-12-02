package com.s401.moas.review.service.dto;

import com.s401.moas.review.domain.Review;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ReviewDto {
    Long id;
    Long contractId;
    Integer reviewerMemberId;
    Integer revieweeMemberId;
    Byte rating;
    String comment;
    LocalDateTime createdAt;
    
    public static ReviewDto from(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .contractId(review.getContractId())
                .reviewerMemberId(review.getReviewerMemberId())
                .revieweeMemberId(review.getRevieweeMemberId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

