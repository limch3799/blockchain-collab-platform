package com.s401.moas.admin.project.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.project.service.dto.AdminProjectDeleteDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "프로젝트 삭제 응답 (관리자용)")
public class AdminProjectDeleteResponse {

    @Schema(description = "삭제된 프로젝트 ID", example = "1")
    private Integer projectId;

    @Schema(description = "삭제일시", example = "2024-11-17T09:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deletedAt;

    @Schema(description = "삭제한 관리자 ID", example = "5")
    private Integer deletedBy;

    public static AdminProjectDeleteResponse from(AdminProjectDeleteDto dto) {
        return AdminProjectDeleteResponse.builder()
                .projectId(dto.getProjectId())
                .deletedAt(dto.getDeletedAt())
                .deletedBy(dto.getDeletedBy())
                .build();
    }
}