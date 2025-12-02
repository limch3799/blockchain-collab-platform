package com.s401.moas.admin.project.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.project.service.dto.AdminProjectArtistDto;
import com.s401.moas.application.domain.ApplicationStatus;
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
@Schema(description = "아티스트 지원 목록 응답 (관리자용)")
public class AdminProjectArtistListResponse {

    @Schema(description = "지원 목록")
    private List<ApplicationArtistItem> content;

    @Schema(description = "페이지 정보")
    private PageInfo pageInfo;

    @Getter
    @Builder
    @Schema(description = "아티스트 지원 항목")
    public static class ApplicationArtistItem {

        @Schema(description = "지원 ID", example = "1")
        private Long applicationId;

        @Schema(description = "프로젝트 ID", example = "10")
        private Integer projectId;

        @Schema(description = "프로젝트 제목", example = "뮤직비디오 촬영 프로젝트")
        private String projectTitle;

        @Schema(description = "지원자 회원 ID", example = "123")
        private Integer memberId;

        @Schema(description = "지원자 닉네임", example = "아티스트박")
        private String memberNickname;

        @Schema(description = "포트폴리오 ID", example = "5")
        private Long portfolioId;

        @Schema(description = "지원 상태", example = "PENDING")
        private ApplicationStatus status;

        @Schema(description = "지원 메시지", example = "열심히 하겠습니다!")
        private String message;

        @Schema(description = "지원일시", example = "2024-11-15T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "수정일시", example = "2024-11-16T14:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        @Schema(description = "취소일시 (관리자용)", example = "2024-11-17T09:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime deletedAt;

        public static ApplicationArtistItem from(AdminProjectArtistDto dto) {
            return ApplicationArtistItem.builder()
                    .applicationId(dto.getApplicationId())
                    .projectId(dto.getProjectId())
                    .projectTitle(dto.getProjectTitle())
                    .memberId(dto.getMemberId())
                    .memberNickname(dto.getMemberNickname())
                    .portfolioId(dto.getPortfolioId())
                    .status(dto.getStatus())
                    .message(dto.getMessage())
                    .createdAt(dto.getCreatedAt())
                    .updatedAt(dto.getUpdatedAt())
                    .deletedAt(dto.getDeletedAt())
                    .build();
        }
    }

    public static AdminProjectArtistListResponse from(Page<AdminProjectArtistDto> page) {
        List<ApplicationArtistItem> content = page.getContent().stream()
                .map(ApplicationArtistItem::from)
                .collect(Collectors.toList());

        PageInfo pageInfo = PageInfo.from(page);

        return AdminProjectArtistListResponse.builder()
                .content(content)
                .pageInfo(pageInfo)
                .build();
    }
}