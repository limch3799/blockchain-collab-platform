package com.s401.moas.application.service.dto;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.project.domain.ProjectPosition;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApplicantDetailBaseDto {
    // Application & Contract
    private final Long applicationId;
    private final ApplicationStatus applicationStatus;
    private final LocalDateTime createdAt;
    private final String message;
    private final Long portfolioId; // 포트폴리오 조회를 위해 필요
    private final Long contractId;
    private final ContractStatus contractStatus;

    // Applicant(Member & Review)
    private final Integer userId;
    private final String nickname;
    private final String profileImageUrl;
    private final Double averageRating;
    private final Long reviewCount;

    // Position
    private final Long projectPositionId;
    private final String positionName;
    private final ProjectPosition.PositionStatus positionStatus;

    // JPQL 생성자 표현식을 위한 생성자
    public ApplicantDetailBaseDto(Long applicationId, ApplicationStatus applicationStatus, LocalDateTime createdAt, String message, Long portfolioId,
                                  Long contractId, ContractStatus contractStatus,
                                  Integer userId, String nickname, String profileImageUrl, Double averageRating, Long reviewCount,
                                  Long projectPositionId, String positionName, ProjectPosition.PositionStatus positionStatus) {
        this.applicationId = applicationId;
        this.applicationStatus = applicationStatus;
        this.createdAt = createdAt;
        this.message = message;
        this.portfolioId = portfolioId;
        this.contractId = contractId;
        this.contractStatus = contractStatus;
        this.userId = userId;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.projectPositionId = projectPositionId;
        this.positionName = positionName;
        this.positionStatus = positionStatus;

    }
}