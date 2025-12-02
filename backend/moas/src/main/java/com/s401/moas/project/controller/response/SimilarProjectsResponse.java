package com.s401.moas.project.controller.response;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.project.service.dto.SimilarProjectsDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 유사 프로젝트 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimilarProjectsResponse {
    private Integer baseProjectId;
    private Integer count;
    private List<SimilarProjectCard> projects;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimilarProjectCard {
        private Integer projectId;
        private String title;
        private String thumbnailUrl;
        private String categoryName;
        private String locationText;
        private String leaderNickname;
        private String leaderProfileImageUrl;
        private Long totalBudget;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        private OffsetDateTime startAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        private OffsetDateTime endAt;

        private List<PositionBrief> positions;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionBrief {
        private String categoryName;
        private String positionName;
        private Long budget;
    }

    /**
     * DTO를 Response로 변환
     */
    public static SimilarProjectsResponse from(SimilarProjectsDto dto) {
        List<SimilarProjectCard> cards = dto.getProjects().stream()
                .map(cardDto -> SimilarProjectCard.builder()
                        .projectId(cardDto.getProjectId())
                        .title(cardDto.getTitle())
                        .thumbnailUrl(cardDto.getThumbnailUrl())
                        .categoryName(cardDto.getCategoryName())
                        .locationText(cardDto.getLocationText())
                        .leaderNickname(cardDto.getLeaderNickname())
                        .leaderProfileImageUrl(cardDto.getLeaderProfileImageUrl())
                        .totalBudget(cardDto.getTotalBudget())
                        .startAt(cardDto.getStartAt() != null ?
                                cardDto.getStartAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                        .endAt(cardDto.getEndAt() != null ?
                                cardDto.getEndAt().atZone(ZoneId.systemDefault()).toOffsetDateTime() : null)
                        .positions(cardDto.getPositions().stream()
                                .map(pos -> PositionBrief.builder()
                                        .categoryName(pos.getCategoryName())
                                        .positionName(pos.getPositionName())
                                        .budget(pos.getBudget())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return SimilarProjectsResponse.builder()
                .baseProjectId(dto.getBaseProjectId())
                .count(cards.size())
                .projects(cards)
                .build();
    }
}