package com.s401.moas.admin.project.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminProjectDeleteDto {
    private Integer projectId;
    private LocalDateTime deletedAt;
    private Integer deletedBy;
}