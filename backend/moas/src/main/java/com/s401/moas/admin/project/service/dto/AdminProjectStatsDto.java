package com.s401.moas.admin.project.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminProjectStatsDto {
    private Long recruitingCount;  // 모집 중
    private Long closedCount;      // 마감됨
    private Long deletedCount;     // 삭제됨
    private Long totalCount;       // 전체
}