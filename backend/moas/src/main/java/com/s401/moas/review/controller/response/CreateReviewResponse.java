package com.s401.moas.review.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.review.service.dto.ReviewDto;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Value
@Builder
public class CreateReviewResponse {
    Long reviewId;
    Long contractId;
    Integer reviewerMemberId;
    Integer revieweeMemberId;
    Byte rating;
    String comment;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    OffsetDateTime createdAt;
    
    public static CreateReviewResponse from(ReviewDto dto) {
        OffsetDateTime createdAt = dto.getCreatedAt() != null
                ? OffsetDateTime.of(dto.getCreatedAt(), ZoneOffset.of("+09:00"))
                : null;
        
        return CreateReviewResponse.builder()
                .reviewId(dto.getId())
                .contractId(dto.getContractId())
                .reviewerMemberId(dto.getReviewerMemberId())
                .revieweeMemberId(dto.getRevieweeMemberId())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(createdAt)
                .build();
    }
}

