package com.s401.moas.project.service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로젝트 서비스 계층 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Integer projectId;
    private String title;
    private String summary;
    private String thumbnailUrl;
    private Integer positionCount;
    private LocalDateTime createdAt;
}
