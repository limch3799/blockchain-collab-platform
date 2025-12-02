package com.s401.moas.application.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.contract.domain.ContractStatus; // ContractStatus import
import com.s401.moas.global.util.PageInfo;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 아티스트의 지원 현황 목록을 위한 서비스 DTO
 */
@Value
@Builder
public class MyApplicationListDto {
    List<MyApplicationDto> applications;
    PageInfo pageInfo;

    /**
     * 개별 지원 현황 항목을 나타내는 서비스 DTO.
     * JPA 프로젝션에서 직접 사용될 생성자를 포함합니다.
     */
    @Value
    public static class MyApplicationDto {
        Long applicationId;
        ApplicationStatus status;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime appliedAt;
        Long projectPositionId;
        String positionName;
        MyApplicationProjectDto project;
        MyApplicationContractDto contract; // Nullable

        public MyApplicationDto(
                Long applicationId,
                ApplicationStatus status,
                LocalDateTime createdAt, // DB에서 조회된 LocalDateTime
                Long projectPositionId,
                String positionName,
                Integer projectId,
                String projectTitle,
                String projectThumbnailUrl,
                Integer leaderId,
                String leaderNickname,
                String leaderProfileUrl,
                Long contractId,
                ContractStatus contractStatus) {
            this.applicationId = applicationId;
            this.status = status;
            // LocalDateTime을 OffsetDateTime으로 변환 (시스템 기본 오프셋 사용)
            this.appliedAt = createdAt;
            this.projectPositionId = projectPositionId;
            this.positionName = positionName;

            // 내부 DTO들 생성
            this.project = MyApplicationProjectDto.builder()
                    .projectId(projectId)
                    .title(projectTitle)
                    .thumbnailUrl(projectThumbnailUrl)
                    .leaderId(leaderId)
                    .leaderNickname(leaderNickname)
                    .leaderProfileUrl(leaderProfileUrl)
                    .build();

            // 계약은 OFFERED 상태일 때만 포함
            if (status == ApplicationStatus.OFFERED && contractId != null) {
                this.contract = MyApplicationContractDto.builder()
                        .contractId(contractId)
                        .status(contractStatus != null ? contractStatus.name() : null)
                        .build();
            } else {
                this.contract = null;
            }
        }
    }

    /**
     * 지원한 프로젝트의 간략한 정보를 나타내는 서비스 DTO
     */
    @Value
    @Builder
    public static class MyApplicationProjectDto {
        Integer projectId;
        String title;
        String thumbnailUrl;
        Integer leaderId;
        String leaderNickname;
        String leaderProfileUrl;
    }

    /**
     * OFFERED 상태일 때 포함되는 계약 정보를 나타내는 서비스 DTO
     */
    @Value
    @Builder
    public static class MyApplicationContractDto {
        Long contractId;
        String status; // ContractStatus Enum의 문자열 표현
    }
}