package com.s401.moas.project.service.dto;

import java.time.OffsetDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProjectListDto {
    int page;
    int size;
    long total;
    Long recruitingCount;
    Long closedCount;
    List<ProjectItemDto> items;

    @Value
    @Builder
    public static class ProjectItemDto {
        Integer id;
        String title;
        String summary;
        String leaderNickname;
        String leaderProfileImageUrl;
        String thumbnailUrl;
        Boolean isOnline;
        String provinceCode;
        String province;
        String districtCode;
        String district;
        OffsetDateTime startAt;
        OffsetDateTime endAt;
        List<PositionBriefDto> positions;
        Long totalBudget;
        Long viewCount;
        OffsetDateTime createdAt;
        OffsetDateTime updatedAt;
        Boolean bookmarked;
        Boolean isClosed;
    }

    @Value
    @Builder
    public static class PositionBriefDto {
        String categoryName;
        String positionName;
        Long budget;
    }
}
