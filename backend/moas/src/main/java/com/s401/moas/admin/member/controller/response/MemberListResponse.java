package com.s401.moas.admin.member.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.member.service.dto.MemberListDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MemberListResponse {
    private final List<MemberItem> content;
    private final PageInfo pageInfo;

    public static MemberListResponse from(MemberListDto dto) {
        return MemberListResponse.builder()
                .content(dto.getContent().stream()
                        .map(MemberItem::from)
                        .collect(Collectors.toList()))
                .pageInfo(PageInfo.from(dto))
                .build();
    }

    @Getter
    @Builder
    public static class MemberItem {
        private final Integer id;
        private final String nickname;
        private final String email;
        private final String role;
        private final String profileImageUrl;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime deletedAt;

        private final MemberStats stats;

        public static MemberItem from(MemberListDto.MemberItemDto dto) {
            return MemberItem.builder()
                    .id(dto.getId())
                    .nickname(dto.getNickname())
                    .email(dto.getEmail())
                    .role(dto.getRole())
                    .profileImageUrl(dto.getProfileImageUrl())
                    .createdAt(dto.getCreatedAt())
                    .deletedAt(dto.getDeletedAt())
                    .stats(MemberStats.from(dto.getStats()))
                    .build();
        }
    }

    @Getter
    @Builder
    public static class MemberStats {
        private final Integer penaltyScore;
        private final Double averageRating;
        private final Integer reviewCount;
        private final Integer pendingInquiries;

        public static MemberStats from(MemberListDto.MemberStatsDto dto) {
            return MemberStats.builder()
                    .penaltyScore(dto.getPenaltyScore())
                    .averageRating(dto.getAverageRating())
                    .reviewCount(dto.getReviewCount())
                    .pendingInquiries(dto.getPendingInquiries())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class PageInfo {
        private final Integer page;
        private final Integer size;
        private final Long totalElements;
        private final Integer totalPages;

        public static PageInfo from(MemberListDto dto) {
            return PageInfo.builder()
                    .page(dto.getPage())
                    .size(dto.getSize())
                    .totalElements(dto.getTotalElements())
                    .totalPages(dto.getTotalPages())
                    .build();
        }
    }
}