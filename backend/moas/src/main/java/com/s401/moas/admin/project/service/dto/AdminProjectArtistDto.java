package com.s401.moas.admin.project.service.dto;

import com.s401.moas.application.domain.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminProjectArtistDto {
    private Long applicationId;
    private Integer projectId;
    private String projectTitle;
    private Integer memberId;
    private String memberNickname;
    private Long portfolioId;
    private ApplicationStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}