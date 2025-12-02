package com.s401.moas.project.controller.response;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로젝트 상세 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailResponse {
    private Integer projectId;
    private String title;
    private String summary;
    private String description;
    private String thumbnailUrl;
    private Boolean isOnline;
    
    private ProvinceInfo province;
    private DistrictInfo district;
    
    private List<PositionInfo> positions;
    
    private Long viewCount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private OffsetDateTime applyDeadline;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private OffsetDateTime startAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private OffsetDateTime endAt;
    
    private LeaderInfo leader;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private OffsetDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private OffsetDateTime updatedAt;
    
    private Boolean isClosed;

    private List<SimilarCard> similar;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimilarCard {
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

        public static SimilarCard from(com.s401.moas.project.repository.ProjectRepository.ProjectCardRow row, List<PositionBrief> positions) {
            return SimilarCard.builder()
                    .projectId(row.getProjectId())
                    .title(row.getTitle())
                    .thumbnailUrl(row.getThumbnailUrl())
                    .categoryName(row.getCategoryName())
                    .locationText(row.getLocationText())
                    .leaderNickname(row.getLeaderNickname())
                    .leaderProfileImageUrl(row.getLeaderProfileImageUrl())
                    .totalBudget(row.getTotalBudget())
                    .startAt(row.getStartAt() != null ? 
                            row.getStartAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)
                    .endAt(row.getEndAt() != null ? 
                            row.getEndAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)
                    .positions(positions)
                    .build();
        }
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

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvinceInfo {
        private Integer id;
        private String nameKo;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistrictInfo {
        private Integer id;
        private String code;
        private String nameKo;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionInfo {
        private Long projectPositionId;
        private Integer positionId;
        private String positionName;
        private Integer categoryId;
        private String categoryName;
        private Long budget;
        private Boolean isClosed;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaderInfo {
        private Integer userId;
        private String nickname;
        private String profileImageUrl;
        private Integer reviewCount;
        private Double averageRating; // 소수점 아래 1자리
    }
}

