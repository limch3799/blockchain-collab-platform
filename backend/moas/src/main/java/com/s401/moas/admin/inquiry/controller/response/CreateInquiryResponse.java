package com.s401.moas.admin.inquiry.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.service.dto.InquiryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문의 작성 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInquiryResponse {
    private Integer inquiryId;
    private String title;
    private InquiryStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public static CreateInquiryResponse from(InquiryDto dto) {
        return CreateInquiryResponse.builder()
                .inquiryId(dto.getInquiryId())
                .title(dto.getTitle())
                .status(dto.getStatus())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}