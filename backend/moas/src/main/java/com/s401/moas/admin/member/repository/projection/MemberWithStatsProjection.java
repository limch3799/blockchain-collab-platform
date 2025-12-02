package com.s401.moas.admin.member.repository.projection;

import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 회원 통계 정보를 포함한 Projection DTO
 * Spring Data JPA가 자동으로 매핑해줍니다.
 */
@Getter
public class MemberWithStatsProjection {
    private final Integer id;
    private final String nickname;
    private final String email;
    private final String role;
    private final String profileImageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime deletedAt;

    // 통계 정보
    private final Integer penaltyScore;
    private final Double averageRating;
    private final Long reviewCount;

    public MemberWithStatsProjection(
            Integer id,
            String nickname,
            String email,
            String role,
            String profileImageUrl,
            LocalDateTime createdAt,
            LocalDateTime deletedAt,
            Integer penaltyScore,
            Double averageRating,
            Long reviewCount
    ) {
        this.id = id;
        this.nickname = nickname;
        this.email = email;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
        this.penaltyScore = penaltyScore != null ? penaltyScore : 0;
        this.averageRating = averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0;
        this.reviewCount = reviewCount != null ? reviewCount : 0L;
    }
}