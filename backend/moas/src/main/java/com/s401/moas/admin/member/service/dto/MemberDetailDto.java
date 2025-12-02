package com.s401.moas.admin.member.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberDetailDto {
    private final Integer id;
    private final String nickname;
    private final String biography;
    private final String email;
    private final String provider;
    private final String providerId;
    private final String phoneNumber;
    private final String profileImageUrl;
    private final String walletAddress;
    private final String role;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final LocalDateTime deletedAt;
    private final MemberStatsDto stats;

    @Getter
    @Builder
    public static class MemberStatsDto {
        private final Integer penaltyScore;
        private final Double averageRating;
        private final Integer reviewCount;
        private final Integer pendingInquiries;
    }
}