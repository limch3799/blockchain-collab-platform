package com.s401.moas.admin.member.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.member.service.dto.MemberDetailDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberDetailResponse {
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

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime updatedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime deletedAt;

    private final MemberStats stats;

    public static MemberDetailResponse from(MemberDetailDto dto) {
        return MemberDetailResponse.builder()
                .id(dto.getId())
                .nickname(dto.getNickname())
                .biography(dto.getBiography())
                .email(dto.getEmail())
                .provider(dto.getProvider())
                .providerId(dto.getProviderId())
                .phoneNumber(dto.getPhoneNumber())
                .profileImageUrl(dto.getProfileImageUrl())
                .walletAddress(dto.getWalletAddress())
                .role(dto.getRole())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .deletedAt(dto.getDeletedAt())
                .stats(MemberStats.from(dto.getStats()))
                .build();
    }

    @Getter
    @Builder
    public static class MemberStats {
        private final Integer penaltyScore;
        private final Double averageRating;
        private final Integer reviewCount;
        private final Integer pendingInquiries;

        public static MemberStats from(MemberDetailDto.MemberStatsDto dto) {
            return MemberStats.builder()
                    .penaltyScore(dto.getPenaltyScore())
                    .averageRating(dto.getAverageRating())
                    .reviewCount(dto.getReviewCount())
                    .pendingInquiries(dto.getPendingInquiries())
                    .build();
        }
    }
}