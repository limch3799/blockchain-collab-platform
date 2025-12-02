package com.s401.moas.admin.project.controller.response;

import com.s401.moas.project.controller.response.ProjectDetailResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

/**
 * 관리자용 프로젝트 상세 응답
 * 기존 ProjectDetailResponse를 그대로 사용
 */
@Getter
@Builder
@Schema(description = "프로젝트 상세 응답 (관리자용)")
public class AdminProjectDetailResponse {

    @Schema(description = "프로젝트 상세 정보")
    private ProjectDetailResponse projectDetail;

    public static AdminProjectDetailResponse from(ProjectDetailResponse projectDetail) {
        return AdminProjectDetailResponse.builder()
                .projectDetail(projectDetail)
                .build();
    }
}