package com.s401.moas.admin.inquiry.service.dto;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class InquiryStatsDto {
    private Long totalCount;
    private List<CategoryStatDto> categoryStats;

    @Getter
    @Builder
    public static class CategoryStatDto {
        private InquiryCategory category;
        private Long pendingCount;
        private Long answeredCount;
        private Long closedCount;
        private Long totalCount;
    }
}