package com.s401.moas.review.service.dto;

import com.s401.moas.contract.domain.Contract;
import com.s401.moas.global.util.BlockExplorerUtil;
import com.s401.moas.review.domain.Review;
import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Page;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Value
@Builder
public class ReviewListDto {
    int page;
    int size;
    long total;
    double averageRating;
    List<ReviewItemDto> items;
    
    public static ReviewListDto from(Page<Review> reviewPage, int page, int size, Map<Long, Contract> contractMap, double averageRating, BlockExplorerUtil blockExplorerUtil) {
        return ReviewListDto.builder()
                .page(page)
                .size(size)
                .total(reviewPage.getTotalElements())
                .averageRating(averageRating)
                .items(reviewPage.getContent().stream()
                        .map(review -> ReviewItemDto.from(
                                review,
                                contractMap.get(review.getContractId()),
                                blockExplorerUtil
                        ))
                        .collect(Collectors.toList()))
                .build();
    }
    
    @Value
    @Builder
    public static class ReviewItemDto {
        Long id;
        Long contractId;
        Integer reviewerMemberId;
        Integer revieweeMemberId;
        Byte rating;
        String comment;
        OffsetDateTime createdAt;
        
        // Contract 정보
        String contractTitle;
        String contractNftUrl;
        OffsetDateTime contractStartAt;
        OffsetDateTime contractEndAt;
        
        public static ReviewItemDto from(Review review, Contract contract, BlockExplorerUtil blockExplorerUtil) {
            String nftUrl = null;
            // Contract가 있고, NFT Token ID가 존재할 때만 URL 생성
            if (contract != null && contract.getId() != null) {
                nftUrl = blockExplorerUtil.buildNftUrl(contract.getId());
            }

            return ReviewItemDto.builder()
                    .id(review.getId())
                    .contractId(review.getContractId())
                    .reviewerMemberId(review.getReviewerMemberId())
                    .revieweeMemberId(review.getRevieweeMemberId())
                    .rating(review.getRating())
                    .comment(review.getComment())
                    .createdAt(review.getCreatedAt() != null 
                            ? OffsetDateTime.of(review.getCreatedAt(), 
                                    ZoneOffset.of("+09:00"))
                            : null)
                    .contractTitle(contract != null ? contract.getTitle() : null)
                    .contractNftUrl(nftUrl)
                    .contractStartAt(contract != null && contract.getStartAt() != null
                            ? OffsetDateTime.of(contract.getStartAt(), 
                                    java.time.ZoneOffset.of("+09:00"))
                            : null)
                    .contractEndAt(contract != null && contract.getEndAt() != null
                            ? OffsetDateTime.of(contract.getEndAt(), 
                                    java.time.ZoneOffset.of("+09:00"))
                            : null)
                    .build();
        }
    }
}

