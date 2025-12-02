package com.s401.moas.admin.project.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.project.service.dto.AdminProjectLeaderDto;
import com.s401.moas.global.util.PageInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@Schema(description = "리더 프로젝트 목록 응답 (관리자용)")
public class AdminProjectLeaderListResponse {

    @Schema(description = "프로젝트 목록")
    private List<ProjectLeaderItem> content;

    @Schema(description = "페이지 정보")
    private PageInfo pageInfo;

    @Getter
    @Builder
    @Schema(description = "리더 프로젝트 항목")
    public static class ProjectLeaderItem {

        @Schema(description = "프로젝트 ID", example = "1")
        private Integer projectId;

        @Schema(description = "프로젝트 제목", example = "뮤직비디오 촬영 프로젝트")
        private String title;

        @Schema(description = "프로젝트 요약", example = "신곡 뮤직비디오 촬영을 위한 팀원 모집")
        private String summary;

        @Schema(description = "작성자 회원 ID", example = "123")
        private Integer memberId;

        @Schema(description = "작성자 닉네임", example = "프로듀서김")
        private String memberNickname;

        @Schema(description = "지원 마감일시", example = "2024-12-31T23:59:59")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime applyDeadline;

        @Schema(description = "프로젝트 시작일시", example = "2025-01-05T09:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime startAt;

        @Schema(description = "프로젝트 종료일시", example = "2025-01-15T18:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime endAt;

        @Schema(description = "조회수", example = "150")
        private Integer viewCount;

        @Schema(description = "생성일시", example = "2024-11-15T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "수정일시", example = "2024-11-16T14:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        @Schema(description = "마감일시", example = "2024-12-20T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime closedAt;

        @Schema(description = "삭제일시 (관리자용)", example = "2024-11-17T09:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime deletedAt;

        @Schema(description = "삭제한 관리자 ID (관리자용)", example = "5")
        private Integer deletedBy;

        @Schema(description = "삭제한 관리자 이름 (관리자용)", example = "관리자김")
        private String deletedByAdminName;

        public static ProjectLeaderItem from(AdminProjectLeaderDto dto) {
            return ProjectLeaderItem.builder()
                    .projectId(dto.getProjectId())
                    .title(dto.getTitle())
                    .summary(dto.getSummary())
                    .memberId(dto.getMemberId())
                    .memberNickname(dto.getMemberNickname())
                    .applyDeadline(dto.getApplyDeadline())
                    .startAt(dto.getStartAt())
                    .endAt(dto.getEndAt())
                    .viewCount(dto.getViewCount())
                    .createdAt(dto.getCreatedAt())
                    .updatedAt(dto.getUpdatedAt())
                    .closedAt(dto.getClosedAt())
                    .deletedAt(dto.getDeletedAt())
                    .deletedBy(dto.getDeletedBy())
                    .deletedByAdminName(dto.getDeletedByAdminName())
                    .build();
        }
    }

    public static AdminProjectLeaderListResponse from(Page<AdminProjectLeaderDto> page) {
        List<ProjectLeaderItem> content = page.getContent().stream()
                .map(ProjectLeaderItem::from)
                .collect(Collectors.toList());

        PageInfo pageInfo = PageInfo.from(page);

        return AdminProjectLeaderListResponse.builder()
                .content(content)
                .pageInfo(pageInfo)
                .build();
    }
}