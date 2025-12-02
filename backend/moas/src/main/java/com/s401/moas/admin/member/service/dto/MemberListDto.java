package com.s401.moas.admin.member.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemberListDto {
    private final List<MemberItemDto> content;
    private final Integer page;
    private final Integer size;
    private final Long totalElements;
    private final Integer totalPages;

    @Getter
    @Builder
    public static class MemberItemDto {
        private final Integer id;
        private final String nickname;
        private final String email;
        private final String role;
        private final String profileImageUrl;
        private final LocalDateTime createdAt;
        private final LocalDateTime deletedAt;
        private final MemberStatsDto stats;
    }

    @Getter
    @Builder
    public static class MemberStatsDto {
        private final Integer penaltyScore;
        private final Double averageRating;
        private final Integer reviewCount;
        private final Integer pendingInquiries;
    }
}