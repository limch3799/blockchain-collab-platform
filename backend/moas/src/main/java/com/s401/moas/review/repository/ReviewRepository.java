package com.s401.moas.review.repository;

import com.s401.moas.member.service.dto.MemberProfileDto;
import com.s401.moas.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /**
     * 받은 리뷰 조회 (revieweeMemberId 기준)
     */
    Page<Review> findByRevieweeMemberIdOrderByCreatedAtDesc(Integer revieweeMemberId, Pageable pageable);
    
    /**
     * 작성한 리뷰 조회 (reviewerMemberId 기준)
     */
    Page<Review> findByReviewerMemberIdOrderByCreatedAtDesc(Integer reviewerMemberId, Pageable pageable);
    
    /**
     * 특정 계약에서 특정 대상에 대해 이미 리뷰를 작성했는지 확인합니다.
     */
    boolean existsByContractIdAndReviewerMemberIdAndRevieweeMemberId(Long contractId, Integer reviewerMemberId, Integer revieweeMemberId);
    
    /**
     * 받은 리뷰의 평균 평점 계산 (revieweeMemberId 기준)
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.revieweeMemberId = :memberId")
    Double calculateAverageRatingByRevieweeMemberId(@Param("memberId") Integer memberId);
    
    /**
     * 작성한 리뷰의 평균 평점 계산 (reviewerMemberId 기준)
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.reviewerMemberId = :memberId")
    Double calculateAverageRatingByReviewerMemberId(@Param("memberId") Integer memberId);

    @Query("SELECT new com.s401.moas.member.service.dto.MemberProfileDto$ReviewStatsDto(" +
            "   ROUND(AVG(r.rating), 2), " +
            "   CAST(COUNT(r.id) AS int)) " +
            "FROM Review r WHERE r.revieweeMemberId = :memberId")
    Optional<MemberProfileDto.ReviewStatsDto> findReviewStatsByMemberId(@Param("memberId") Integer memberId);
}

