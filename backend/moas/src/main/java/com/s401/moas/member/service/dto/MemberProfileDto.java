package com.s401.moas.member.service.dto;

import com.s401.moas.member.domain.Member;
import lombok.Getter;

@Getter
public class MemberProfileDto {
    private final Member member;
    private final ReviewStatsDto reviewStats;

    public MemberProfileDto(Member member, ReviewStatsDto reviewStats) {
        this.member = member;
        this.reviewStats = reviewStats;
    }

    @Getter
    public static class ReviewStatsDto {
        private final Double averageRating;
        private final Integer reviewCount;

        public ReviewStatsDto(Double averageRating, Integer reviewCount) {
            this.averageRating = (averageRating != null) ? averageRating : 0.0;
            this.reviewCount = (reviewCount != null) ? reviewCount : 0;
        }
    }
}