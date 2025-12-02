package com.s401.moas.application.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.application.service.dto.ApplicationDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApplicationCreateResponse {
    private final Long applicationId;
    private final String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;

    @Builder
    private ApplicationCreateResponse(Long applicationId, String status, LocalDateTime createdAt) {
        this.applicationId = applicationId;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Service DTO를 Controller Response 객체로 변환하는 정적 팩토리 메서드
    public static ApplicationCreateResponse from(ApplicationDto dto) {
        return ApplicationCreateResponse.builder()
                .applicationId(dto.getApplicationId())
                .status(dto.getStatus().name())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
