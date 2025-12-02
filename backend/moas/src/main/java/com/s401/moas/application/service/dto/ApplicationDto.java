package com.s401.moas.application.service.dto;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApplicationDto {
    private final Long applicationId;
    private final ApplicationStatus status;
    private final LocalDateTime createdAt;

    @Builder
    private ApplicationDto(Long applicationId, ApplicationStatus status, LocalDateTime createdAt) {
        this.applicationId = applicationId;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Entity를 Service DTO로 변환하는 정적 팩토리 메서드
    public static ApplicationDto from(ProjectApplication entity) {
        return ApplicationDto.builder()
                .applicationId(entity.getId())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}