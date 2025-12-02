package com.s401.moas.member.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.review.service.dto.ReviewListDto;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Value
@Builder
public class ReviewListResponse {
    int page;
    int size;
    long total;
    double averageRating;
    List<ReviewItemResponse> items;
    
    public static ReviewListResponse from(ReviewListDto dto) {
        return ReviewListResponse.builder()
                .page(dto.getPage())
                .size(dto.getSize())
                .total(dto.getTotal())
                .averageRating(dto.getAverageRating())
                .items(dto.getItems().stream()
                        .map(ReviewItemResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }
    
    @Value
    @Builder
    public static class ReviewItemResponse {
        Long id;
        Long contractId;
        Integer reviewerMemberId;
        Integer revieweeMemberId;
        Byte rating;
        String comment;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime createdAt;
        
        // Contract 정보
        String contractTitle;
        String contractNftUrl;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime contractStartAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime contractEndAt;
        
        public static ReviewItemResponse from(ReviewListDto.ReviewItemDto dto) {
            return ReviewItemResponse.builder()
                    .id(dto.getId())
                    .contractId(dto.getContractId())
                    .reviewerMemberId(dto.getReviewerMemberId())
                    .revieweeMemberId(dto.getRevieweeMemberId())
                    .rating(dto.getRating())
                    .comment(dto.getComment())
                    .createdAt(dto.getCreatedAt())
                    .contractTitle(dto.getContractTitle())
                    .contractNftUrl(dto.getContractNftUrl())
                    .contractStartAt(dto.getContractStartAt())
                    .contractEndAt(dto.getContractEndAt())
                    .build();
        }
    }
}

