package com.s401.moas.admin.contract.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.contract.service.dto.ContractListDto;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.global.util.PageInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Schema(description = "계약 목록 응답")
public class ContractListResponse {

    @Schema(description = "계약 목록")
    private List<ContractItem> content;

    @Schema(description = "페이징 정보")
    private PageInfo pageInfo;

    @Getter
    @AllArgsConstructor
    @Schema(description = "계약 항목")
    public static class ContractItem {
        @Schema(description = "계약 ID", example = "123")
        private Long contractId;

        @Schema(description = "계약 제목", example = "2024 신년 콘서트 촬영 계약")
        private String title;

        @Schema(description = "프로젝트 정보")
        private ProjectInfo project;

        @Schema(description = "리더 정보")
        private MemberInfo leader;

        @Schema(description = "아티스트 정보")
        private MemberInfo artist;

        @Schema(description = "계약 금액", example = "5000000")
        private Long amount;

        @Schema(description = "계약 상태", example = "COMPLETED")
        private ContractStatus status;

        @Schema(description = "계약 시작일", example = "2024-01-15T00:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime startAt;

        @Schema(description = "계약 종료일", example = "2024-01-20T00:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime endAt;

        @Schema(description = "생성일시", example = "2023-12-01T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }

    @Getter
    @AllArgsConstructor
    @Schema(description = "프로젝트 정보")
    public static class ProjectInfo {
        @Schema(description = "프로젝트 ID", example = "42")
        private Integer id;

        @Schema(description = "프로젝트 제목", example = "2024 신년 콘서트")
        private String title;
    }

    @Getter
    @AllArgsConstructor
    @Schema(description = "회원 정보")
    public static class MemberInfo {
        @Schema(description = "회원 ID", example = "1234")
        private Integer id;

        @Schema(description = "닉네임", example = "홍길동")
        private String nickname;
    }

    public static ContractListResponse from(Page<ContractListDto> page) {
        List<ContractItem> items = page.getContent().stream()
                .map(dto -> new ContractItem(
                        dto.getContractId(),
                        dto.getTitle(),
                        new ProjectInfo(dto.getProjectId(), dto.getProjectTitle()),
                        new MemberInfo(dto.getLeaderId(), dto.getLeaderNickname()),
                        new MemberInfo(dto.getArtistId(), dto.getArtistNickname()),
                        dto.getTotalAmount(),
                        dto.getStatus(),
                        dto.getStartAt(),
                        dto.getEndAt(),
                        dto.getCreatedAt()
                ))
                .toList();

        return new ContractListResponse(items, PageInfo.from(page));
    }
}