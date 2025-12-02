package com.s401.moas.project.controller.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.s401.moas.project.service.dto.ProjectListDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProjectListResponse {
    int page;
    int size;
    long total;
    @Schema(description = "진행중인 공고 개수", example = "5")
    Long recruitingCount;
    @Schema(description = "마감된 공고 개수", example = "3")
    Long closedCount;
    List<ProjectCardResponse> items;

    public static ProjectListResponse from(ProjectListDto dto) {
        return ProjectListResponse.builder()
                .page(dto.getPage())
                .size(dto.getSize())
                .total(dto.getTotal())
                .recruitingCount(dto.getRecruitingCount())
                .closedCount(dto.getClosedCount())
                .items(dto.getItems().stream().map(ProjectCardResponse::from).collect(Collectors.toList()))
                .build();
    }

    @Value
    @Builder
    public static class ProjectCardResponse {
        Integer id;
        String title;
        String summary;
        @Schema(description = "프로젝트를 등록한 리더 닉네임", example = "아트리더")
        String leaderNickname;
        @Schema(description = "프로젝트를 등록한 리더 프로필 이미지 URL", example = "https://cdn.example.com/profile/leader.png")
        String leaderProfileImageUrl;
        String thumbnailUrl;
        Boolean isOnline;
        String provinceCode;
        String province;
        String districtCode;
        String district;
        OffsetDateTime startAt;
        OffsetDateTime endAt;
        List<ProjectPositionBrief> positions;
        Long totalBudget;
        Long viewCount;
        OffsetDateTime createdAt;
        OffsetDateTime updatedAt;
        Boolean bookmarked;
        Boolean isClosed;

        public static ProjectCardResponse from(ProjectListDto.ProjectItemDto dto) {
            return ProjectCardResponse.builder()
                    .id(dto.getId())
                    .title(dto.getTitle())
                    .summary(dto.getSummary())
                    .leaderNickname(dto.getLeaderNickname())
                    .leaderProfileImageUrl(dto.getLeaderProfileImageUrl())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .isOnline(dto.getIsOnline())
                    .provinceCode(dto.getProvinceCode())
                    .province(dto.getProvince())
                    .districtCode(dto.getDistrictCode())
                    .district(dto.getDistrict())
                    .startAt(dto.getStartAt())
                    .endAt(dto.getEndAt())
                    .positions(dto.getPositions().stream().map(ProjectPositionBrief::from).collect(Collectors.toList()))
                    .totalBudget(dto.getTotalBudget())
                    .viewCount(dto.getViewCount())
                    .createdAt(dto.getCreatedAt())
                    .updatedAt(dto.getUpdatedAt())
                    .bookmarked(dto.getBookmarked())
                    .isClosed(dto.getIsClosed())
                    .build();
        }
    }

    @Value
    @Builder
    public static class ProjectPositionBrief {
        String categoryName;
        String positionName;
        Long budget;

        public static ProjectPositionBrief from(ProjectListDto.PositionBriefDto dto) {
            return ProjectPositionBrief.builder()
                    .categoryName(dto.getCategoryName())
                    .positionName(dto.getPositionName())
                    .budget(dto.getBudget())
                    .build();
        }
    }
}
