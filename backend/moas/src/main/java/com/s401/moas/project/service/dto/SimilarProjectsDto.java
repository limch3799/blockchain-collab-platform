package com.s401.moas.project.service.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 유사 프로젝트 서비스 계층 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimilarProjectsDto {
    private Integer baseProjectId;
    private List<SimilarProjectCardDto> projects;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimilarProjectCardDto {
        private Integer projectId;
        private String title;
        private String thumbnailUrl;
        private String categoryName;
        private String locationText;
        private String leaderNickname;
        private String leaderProfileImageUrl;
        private Long totalBudget;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private List<PositionBriefDto> positions;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionBriefDto {
        private String categoryName;
        private String positionName;
        private Long budget;
    }
}