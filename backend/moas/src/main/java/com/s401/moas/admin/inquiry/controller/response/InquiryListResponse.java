package com.s401.moas.admin.inquiry.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.service.dto.InquiryDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@Schema(description = "문의 목록 응답")
public class InquiryListResponse {

    @Schema(description = "문의 목록")
    private List<InquiryItemResponse> content;

    @Schema(description = "페이지 정보")
    private PageInfo pageInfo;

    @Getter
    @Builder
    @Schema(description = "문의 항목")
    public static class InquiryItemResponse {

        @Schema(description = "문의 ID", example = "1")
        private Integer inquiryId;

        @Schema(description = "회원 ID", example = "123")
        private Integer memberId;

        @Schema(description = "문의 유형", example = "계약관리")
        private InquiryCategory category;

        @Schema(description = "제목", example = "계약 취소 문의")
        private String title;

        @Schema(description = "문의 상태", example = "PENDING")
        private InquiryStatus status;

        @Schema(description = "댓글 수", example = "3")
        private Long commentCount;

        @Schema(description = "생성일시", example = "2024-11-15T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "수정일시", example = "2024-11-15T15:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @Schema(description = "페이지 정보")
    public static class PageInfo {

        @Schema(description = "현재 페이지", example = "0")
        private int page;

        @Schema(description = "페이지 크기", example = "10")
        private int size;

        @Schema(description = "전체 요소 수", example = "50")
        private long totalElements;

        @Schema(description = "전체 페이지 수", example = "5")
        private int totalPages;
    }

    public static InquiryListResponse from(Page<InquiryDto> inquiryPage) {
        List<InquiryItemResponse> content = inquiryPage.getContent().stream()
                .map(dto -> InquiryItemResponse.builder()
                        .inquiryId(dto.getInquiryId())
                        .memberId(dto.getMemberId())
                        .category(dto.getCategory())
                        .title(dto.getTitle())
                        .status(dto.getStatus())
                        .commentCount(dto.getCommentCount())
                        .createdAt(dto.getCreatedAt())
                        .updatedAt(dto.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        PageInfo pageInfo = PageInfo.builder()
                .page(inquiryPage.getNumber())
                .size(inquiryPage.getSize())
                .totalElements(inquiryPage.getTotalElements())
                .totalPages(inquiryPage.getTotalPages())
                .build();

        return InquiryListResponse.builder()
                .content(content)
                .pageInfo(pageInfo)
                .build();
    }
}