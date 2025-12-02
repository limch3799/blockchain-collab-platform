package com.s401.moas.admin.inquiry.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문의 종료 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloseInquiryResponse {
    private Integer inquiryId;
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime closedAt;

    public static CloseInquiryResponse of(Integer inquiryId) {
        return CloseInquiryResponse.builder()
                .inquiryId(inquiryId)
                .message("문의가 종료되었습니다.")
                .closedAt(LocalDateTime.now())
                .build();
    }
}