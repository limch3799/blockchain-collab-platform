package com.s401.moas.admin.project.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminProjectLeaderDto {
    private Integer projectId;
    private String title;
    private String summary;
    private Integer memberId;
    private String memberNickname;
    private LocalDateTime applyDeadline;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
    private LocalDateTime deletedAt;
    private Integer deletedBy;
    private String deletedByAdminName;
}