package com.s401.moas.application.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.service.dto.MyApplicationListDto;
import com.s401.moas.global.util.PageInfo;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 아티스트의 지원 현황 목록을 위한 최상위 응답 DTO
 */
@Value
@Builder
public class MyApplicationListResponse {
    List<MyApplicationResponse> applications;
    PageInfoResponse pageInfo;

    public static MyApplicationListResponse from(MyApplicationListDto dto) {
        return MyApplicationListResponse.builder()
                .applications(dto.getApplications().stream()
                        .map(MyApplicationResponse::from)
                        .collect(Collectors.toList()))
                .pageInfo(PageInfoResponse.from(dto.getPageInfo()))
                .build();
    }

    /**
     * 개별 지원 현황 항목을 나타내는 DTO
     */
    @Value
    @Builder
    public static class MyApplicationResponse {
        Long applicationId;
        ApplicationStatus status;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime appliedAt;
        Long projectPositionId;
        String positionName;
        MyApplicationProjectResponse project;
        MyApplicationContractResponse contract; // OFFERED 상태일 때만 포함 (Nullable)

        public static MyApplicationResponse from(MyApplicationListDto.MyApplicationDto dto) {
            return MyApplicationResponse.builder()
                    .applicationId(dto.getApplicationId())
                    .status(dto.getStatus())
                    .appliedAt(dto.getAppliedAt())
                    .projectPositionId(dto.getProjectPositionId())
                    .positionName(dto.getPositionName())
                    .project(MyApplicationProjectResponse.from(dto.getProject()))
                    .contract(dto.getContract() != null ? MyApplicationContractResponse.from(dto.getContract()) : null)
                    .build();
        }
    }

    /**
     * 지원한 프로젝트의 간략한 정보를 나타내는 DTO
     */
    @Value
    @Builder
    public static class MyApplicationProjectResponse {
        Integer projectId;
        String title;
        String thumbnailUrl;
        Integer leaderId;
        String leaderNickname;
        String leaderProfileUrl;

        public static MyApplicationProjectResponse from(MyApplicationListDto.MyApplicationProjectDto dto) {
            return MyApplicationProjectResponse.builder()
                    .projectId(dto.getProjectId())
                    .title(dto.getTitle())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .leaderId(dto.getLeaderId())
                    .leaderNickname(dto.getLeaderNickname())
                    .leaderProfileUrl(dto.getLeaderProfileUrl())
                    .build();
        }
    }

    /**
     * OFFERED 상태일 때 포함되는 계약 정보를 나타내는 DTO
     */
    @Value
    @Builder
    public static class MyApplicationContractResponse {
        Long contractId;
        String status; // ContractStatus Enum의 문자열 표현

        public static MyApplicationContractResponse from(MyApplicationListDto.MyApplicationContractDto dto) {
            return MyApplicationContractResponse.builder()
                    .contractId(dto.getContractId())
                    .status(dto.getStatus())
                    .build();
        }
    }

    /**
     * 공통 페이지 정보 DTO (컨트롤러 응답용)
     */
    @Value
    @Builder
    public static class PageInfoResponse {
        int page;
        int size;
        long totalElements;
        int totalPages;

        public static PageInfoResponse from(PageInfo info) {
            return PageInfoResponse.builder()
                    .page(info.getPage())
                    .size(info.getSize())
                    .totalElements(info.getTotalElements())
                    .totalPages(info.getTotalPages())
                    .build();
        }
    }
}