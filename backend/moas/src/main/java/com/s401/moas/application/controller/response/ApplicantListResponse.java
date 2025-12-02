package com.s401.moas.application.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.application.domain.ApplicationStatus; // ENUM 타입 import
import com.s401.moas.contract.domain.ContractStatus; // ENUM 타입 import
import com.s401.moas.project.domain.ProjectPosition;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor; // 기본 생성자 추가
import lombok.AllArgsConstructor; // 모든 필드 생성자 추가

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantListResponse {

    private List<ProjectPositionInfo> positions;

    private List<ApplicationSummary> applications;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectPositionInfo {
        private String categoryName;
        private String positionName;
        private Long projectPositionId;
        private Long budget;
        private String positionStatus;
    }

    @Getter
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ApplicationSummary {
        private final Long applicationId;
        private final String applicationStatus;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;

        private final String message;
        private final Long contractId;
        private final String contractStatus;
        private final ApplicantInfo applicant;
        private final PositionInfo position;

        public ApplicationSummary(
                // Application & Contract 정보
                Long applicationId, ApplicationStatus applicationStatus, LocalDateTime createdAt, String message,
                Long contractId, ContractStatus contractStatus,
                // Applicant(Member & Review) 정보
                Integer userId, String nickname, String profileImageUrl, Double averageRating, Long reviewCount,
                // Position 정보
                Long projectPositionId, String positionName, ProjectPosition.PositionStatus positionStatus
        ) {
            this.applicationId = applicationId;
            this.applicationStatus = applicationStatus.name();
            this.createdAt = createdAt;
            this.message = message;
            this.contractId = contractId;
            this.contractStatus = (contractStatus != null) ? contractStatus.name() : null;

            this.applicant = ApplicantInfo.builder()
                    .userId(userId)
                    .nickname(nickname)
                    .profileImageUrl(profileImageUrl)
                    .averageRating(averageRating != null ? averageRating : 0.0) // AVG 결과가 null일 수 있음
                    .reviewCount(reviewCount != null ? reviewCount.intValue() : 0) // COUNT 결과가 null일 수 있음
                    .build();

            this.position = PositionInfo.builder()
                    .projectPositionId(projectPositionId)
                    .positionName(positionName)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class ApplicantInfo {
        private Integer userId;
        private String nickname;
        private String profileImageUrl;
        private Double averageRating;
        private Integer reviewCount;
    }

    @Getter
    @Builder
    public static class PositionInfo {
        private Long projectPositionId;
        private String positionName;
    }
}