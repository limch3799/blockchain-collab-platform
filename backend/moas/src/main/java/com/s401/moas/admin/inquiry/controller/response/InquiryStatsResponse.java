package com.s401.moas.admin.inquiry.controller.response;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.service.dto.InquiryStatsDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@Schema(description = "문의 통계 응답")
public class InquiryStatsResponse {

    @Schema(description = "전체 문의 수", example = "150")
    private Long totalCount;

    @Schema(description = "카테고리별 통계")
    private List<CategoryStatResponse> categoryStats;

    @Getter
    @Builder
    @Schema(description = "카테고리별 통계 정보")
    public static class CategoryStatResponse {

        @Schema(description = "문의 유형", example = "CONTRACT")
        private InquiryCategory category;

        @Schema(description = "대기 중 문의 수", example = "15")
        private Long pendingCount;

        @Schema(description = "답변 완료 문의 수", example = "30")
        private Long answeredCount;

        @Schema(description = "종료된 문의 수", example = "10")
        private Long closedCount;

        @Schema(description = "해당 카테고리 전체 문의 수", example = "55")
        private Long totalCount;
    }

    public static InquiryStatsResponse from(InquiryStatsDto dto) {
        List<CategoryStatResponse> categoryStats = dto.getCategoryStats().stream()
                .map(stat -> CategoryStatResponse.builder()
                        .category(stat.getCategory())
                        .pendingCount(stat.getPendingCount())
                        .answeredCount(stat.getAnsweredCount())
                        .closedCount(stat.getClosedCount())
                        .totalCount(stat.getTotalCount())
                        .build())
                .collect(Collectors.toList());

        return InquiryStatsResponse.builder()
                .totalCount(dto.getTotalCount())
                .categoryStats(categoryStats)
                .build();
    }
}