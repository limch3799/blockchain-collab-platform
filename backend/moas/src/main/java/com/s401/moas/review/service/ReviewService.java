package com.s401.moas.review.service;

import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.global.util.BlockExplorerUtil;
import com.s401.moas.review.domain.Review;
import com.s401.moas.review.exception.ReviewException;
import com.s401.moas.review.repository.ReviewRepository;
import com.s401.moas.review.service.dto.ReviewDto;
import com.s401.moas.review.service.dto.ReviewListDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ContractRepository contractRepository;
    private final BlockExplorerUtil blockExplorerUtil;
    private static final Set<ContractStatus> ALLOWED_REVIEW_STATUSES =
            EnumSet.of(ContractStatus.COMPLETED, ContractStatus.CANCELED);
    
    public ReviewListDto getMyReviews(Integer memberId, String type, int page, int size) {
        int normalizedPage = Math.max(1, page);
        int normalizedSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(normalizedPage - 1, normalizedSize);
        
        Page<Review> reviewPage;
        if ("sent".equals(type)) {
            // 작성한 리뷰
            reviewPage = reviewRepository.findByReviewerMemberIdOrderByCreatedAtDesc(memberId, pageable);
        } else {
            // 받은 리뷰 (기본값)
            reviewPage = reviewRepository.findByRevieweeMemberIdOrderByCreatedAtDesc(memberId, pageable);
        }
        
        // Contract 정보를 한 번에 조회 (N+1 문제 방지)
        List<Review> reviews = reviewPage.getContent();
        Set<Long> contractIds = reviews.stream()
                .map(Review::getContractId)
                .collect(Collectors.toSet());
        
        Map<Long, Contract> contractMap = contractRepository.findAllById(contractIds)
                .stream()
                .collect(Collectors.toMap(Contract::getId, contract -> contract));
        
        // 평균 평점 계산
        Double averageRating;
        if ("sent".equals(type)) {
            // 작성한 리뷰의 평균 평점 (일반적으로는 필요 없지만 일관성을 위해)
            averageRating = reviewRepository.calculateAverageRatingByReviewerMemberId(memberId);
        } else {
            // 받은 리뷰의 평균 평점
            averageRating = reviewRepository.calculateAverageRatingByRevieweeMemberId(memberId);
        }
        
        // 소수점 첫째 자리까지 반올림
        if (averageRating != null) {
            averageRating = Math.round(averageRating * 10.0) / 10.0;
        } else {
            averageRating = 0.0;
        }
        
        return ReviewListDto.from(reviewPage, normalizedPage, normalizedSize, contractMap, averageRating, blockExplorerUtil);
    }
    
    @Transactional
    public ReviewDto createReview(Integer reviewerMemberId,
                                  Long contractId,
                                  Integer revieweeMemberId,
                                  Byte rating,
                                  String comment) {
        validateInputs(contractId, revieweeMemberId, rating);
        
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> {
                    log.warn("계약을 찾을 수 없음 - contractId: {}", contractId);
                    return ContractException.contractNotFound();
                });
        
        boolean reviewerIsLeader = contract.getLeaderMemberId().equals(reviewerMemberId);
        boolean reviewerIsArtist = contract.getArtistMemberId().equals(reviewerMemberId);
        
        if (!reviewerIsLeader && !reviewerIsArtist) {
            log.warn("리뷰 작성 권한 없음 - contractId: {}, reviewer: {}", contractId, reviewerMemberId);
            throw ReviewException.reviewerNotParticipant();
        }
        
        boolean revieweeIsLeader = contract.getLeaderMemberId().equals(revieweeMemberId);
        boolean revieweeIsArtist = contract.getArtistMemberId().equals(revieweeMemberId);
        
        if (!revieweeIsLeader && !revieweeIsArtist) {
            log.warn("리뷰 대상이 계약 참가자가 아님 - contractId: {}, reviewee: {}", contractId, revieweeMemberId);
            throw ReviewException.revieweeNotParticipant();
        }
        
        if (Objects.equals(reviewerMemberId, revieweeMemberId)) {
            log.warn("본인 리뷰 금지 - contractId: {}, memberId: {}", contractId, reviewerMemberId);
            throw ReviewException.cannotReviewSelf();
        }
        
        if ((reviewerIsLeader && !revieweeIsArtist) || (reviewerIsArtist && !revieweeIsLeader)) {
            log.warn("리뷰 작성자/대상자 불일치 - contractId: {}, reviewer: {}, reviewee: {}", contractId, reviewerMemberId, revieweeMemberId);
            throw ReviewException.invalidReviewPair();
        }
        
        if (!ALLOWED_REVIEW_STATUSES.contains(contract.getStatus())) {
            log.warn("리뷰 불가 상태 - contractId: {}, status: {}", contractId, contract.getStatus());
            throw ReviewException.invalidContractStatus(contract.getStatus());
        }
        
        boolean alreadyReviewed = reviewRepository
                .existsByContractIdAndReviewerMemberIdAndRevieweeMemberId(contractId, reviewerMemberId, revieweeMemberId);
        if (alreadyReviewed) {
            log.warn("이미 리뷰 작성됨 - contractId: {}, reviewer: {}, reviewee: {}", contractId, reviewerMemberId, revieweeMemberId);
            throw ReviewException.reviewAlreadyExists();
        }
        
        String sanitizedComment = sanitizeComment(comment);
        
        Review review = Review.builder()
                .contractId(contractId)
                .reviewerMemberId(reviewerMemberId)
                .revieweeMemberId(revieweeMemberId)
                .rating(rating)
                .comment(sanitizedComment)
                .build();
        
        Review saved = reviewRepository.save(review);
        
        log.info("리뷰 저장 완료 - reviewId: {}, contractId: {}, reviewer: {}, reviewee: {}",
                saved.getId(), contractId, reviewerMemberId, revieweeMemberId);
        
        return ReviewDto.from(saved);
    }
    
    private String sanitizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
    
    private void validateInputs(Long contractId, Integer revieweeMemberId, Byte rating) {
        if (contractId == null) {
            throw new IllegalArgumentException("계약 ID는 필수입니다.");
        }
        if (revieweeMemberId == null) {
            throw new IllegalArgumentException("리뷰 대상 회원 ID는 필수입니다.");
        }
        if (rating == null) {
            throw new IllegalArgumentException("평점은 필수입니다.");
        }
    }
}

