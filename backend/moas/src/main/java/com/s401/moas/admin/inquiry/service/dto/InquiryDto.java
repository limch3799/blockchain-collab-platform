package com.s401.moas.admin.inquiry.service.dto;

import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문의 목록 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDto {
    private Integer inquiryId;
    private Integer memberId;
    private InquiryCategory category;
    private String title;
    private InquiryStatus status;
    private Long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}