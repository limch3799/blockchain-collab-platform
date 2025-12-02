package com.s401.moas.admin.inquiry.service.dto;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 문의 상세 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDetailDto {
    private Integer inquiryId;
    private Integer memberId;
    private InquiryCategory category;
    private String memberNickname;
    private String title;
    private String content;
    private InquiryStatus status;
    private List<FileDto> files;
    private List<InquiryCommentDto> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}