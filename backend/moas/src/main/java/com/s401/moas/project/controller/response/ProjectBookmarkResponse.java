package com.s401.moas.project.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 프로젝트 북마크 등록 응답 DTO
 */
@Getter
@Builder
public class ProjectBookmarkResponse {
    private final Integer memberId;
    private final Integer projectId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;

    /**
     * 북마크 정보로부터 ProjectBookmarkResponse 생성
     */
    public static ProjectBookmarkResponse of(Integer memberId, Integer projectId, LocalDateTime createdAt) {
        return ProjectBookmarkResponse.builder()
                .memberId(memberId)
                .projectId(projectId)
                .createdAt(createdAt)
                .build();
    }
}

