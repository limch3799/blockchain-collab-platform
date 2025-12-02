package com.s401.moas.review.controller;

import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.review.controller.request.CreateReviewRequest;
import com.s401.moas.review.controller.response.CreateReviewResponse;
import com.s401.moas.review.service.ReviewService;
import com.s401.moas.review.service.dto.ReviewDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController implements ReviewControllerSpec {
    
    private final ReviewService reviewService;
    
    @PostMapping
    @Override
    public ResponseEntity<CreateReviewResponse> createReview(@Valid @RequestBody(required = false) CreateReviewRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("요청 본문이 필요합니다.");
        }
        Integer reviewerMemberId = SecurityUtil.getCurrentMemberId();
        log.info("리뷰 작성 요청 - contractId: {}, reviewer: {}, reviewee: {}",
                request.getContractId(), reviewerMemberId, request.getRevieweeMemberId());
        
        ReviewDto dto = reviewService.createReview(
                reviewerMemberId,
                request.getContractId(),
                request.getRevieweeMemberId(),
                request.getRating(),
                request.getComment());
        
        log.info("리뷰 작성 성공 - reviewId: {}, contractId: {}, reviewer: {}, reviewee: {}",
                dto.getId(), dto.getContractId(), dto.getReviewerMemberId(), dto.getRevieweeMemberId());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CreateReviewResponse.from(dto));
    }
}

