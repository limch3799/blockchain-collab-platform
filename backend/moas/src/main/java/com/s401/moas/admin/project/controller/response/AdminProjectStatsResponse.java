package com.s401.moas.admin.project.controller.response;

import com.s401.moas.admin.project.service.dto.AdminProjectStatsDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "프로젝트 통계 응답 (관리자용)")
public class AdminProjectStatsResponse {

    @Schema(description = "모집 중인 프로젝트 수", example = "45")
    private Long recruitingCount;

    @Schema(description = "마감된 프로젝트 수", example = "30")
    private Long closedCount;

    @Schema(description = "삭제된 프로젝트 수", example = "5")
    private Long deletedCount;

    @Schema(description = "전체 프로젝트 수", example = "80")
    private Long totalCount;

    public static AdminProjectStatsResponse from(AdminProjectStatsDto dto) {
        return AdminProjectStatsResponse.builder()
                .recruitingCount(dto.getRecruitingCount())
                .closedCount(dto.getClosedCount())
                .deletedCount(dto.getDeletedCount())
                .totalCount(dto.getTotalCount())
                .build();
    }
}