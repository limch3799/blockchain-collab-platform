package com.s401.moas.project.controller.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.project.service.dto.ProjectDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로젝트 등록 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectResponse {
    private Integer projectId;
    private String title;
    private String summary;
    private String thumbnailUrl;
    private Integer positionCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * ProjectDto를 CreateProjectResponse로 변환
     */
    public static CreateProjectResponse from(ProjectDto dto) {
        return CreateProjectResponse.builder()
                .projectId(dto.getProjectId())
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .thumbnailUrl(dto.getThumbnailUrl())
                .positionCount(dto.getPositionCount())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
