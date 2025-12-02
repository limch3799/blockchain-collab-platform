package com.s401.moas.application.domain;

import com.s401.moas.application.exception.ApplicationException;
import com.s401.moas.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_application")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectApplication extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_position_id", nullable = false)
    private Long projectPositionId;

    @Column(name = "member_id", nullable = false)
    private Integer memberId; // INT UNSIGNED -> Integer

    @Column(name = "portfolio_id", nullable = false)
    private Long portfolioId; // BIGINT UNSIGNED -> Long

    @Column(name = "contract_id")
    private Long contractId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(length = 100)
    private String message;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public ProjectApplication(Long projectPositionId, Integer memberId, Long portfolioId, String message) {
        this.projectPositionId = projectPositionId;
        this.memberId = memberId;
        this.portfolioId = portfolioId;
        this.message = message;
        this.status = ApplicationStatus.PENDING;
    }

    /**
     * 지원을 취소합니다. (Soft Delete)
     * 지원서의 상태가 PENDING일 때만 취소할 수 있습니다.
     */
    public void cancel() {
        // 409 Conflict 조건: PENDING 상태가 아니면 취소 불가
        if (this.status != ApplicationStatus.PENDING) {
            throw ApplicationException.cannotCancelNotPending();
        }

        // 이미 취소된 지원서인지 확인하는 로직 (서비스 계층에서도 확인)
        if (this.deletedAt != null) {
            return;
        }
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 프로젝트 리더가 지원을 거절합니다.
     * 지원서의 상태가 PENDING일 때만 거절할 수 있습니다.
     */
    public void reject() {
        // 409 Conflict 조건: PENDING 상태가 아니면 처리 불가
        if (this.status != ApplicationStatus.PENDING) {
            throw ApplicationException.cannotProcessNotPending();
        }
        this.status = ApplicationStatus.REJECTED;
    }

    /**
     * 프로젝트 리더가 채용을 제안합니다.
     * 지원서의 상태가 PENDING일 때만 제안할 수 있습니다.
     */
    public void offer(Long contractId) {
        // 409 Conflict 조건: PENDING 상태가 아니면 처리 불가
        if (this.status != ApplicationStatus.PENDING) {
            throw ApplicationException.cannotProcessNotPending();
        }

        // 400 Bad Request 조건: 제안 시 contractId는 필수
        if (contractId == null) {
            throw ApplicationException.contractIdMustNotBeNullForOffer();
        }

        this.status = ApplicationStatus.OFFERED;
        this.contractId = contractId;
    }

    /**
     * 리더가 제안했던 계약을 철회하여 지원을 거절 처리합니다.
     * 지원서의 상태가 OFFERED일 때만 거절(철회)할 수 있습니다.
     */
    public void rejectFromOffered() {
        // 409 Conflict 조건: OFFERED 상태가 아니면 처리 불가
        if (this.status != ApplicationStatus.OFFERED) {
            // 예외는 상황에 맞게 새로 만드시거나 기존 것을 활용하세요.
            // ex: throw ApplicationException.cannotProcessNotOffered();
            throw ApplicationException.invalidApplicationStatus();
        }
        this.status = ApplicationStatus.REJECTED;
    }

    /**
     * 계약이 최종 성사되어 지원을 완료 처리합니다.
     * 지원서의 상태가 OFFERED일 때만 완료할 수 있습니다.
     */
    public void complete() {
        // 409 Conflict 조건: OFFERED 상태가 아니면 완료 불가
        if (this.status != ApplicationStatus.OFFERED) {
            throw ApplicationException.cannotCompleteNotOffered();
        }
        this.status = ApplicationStatus.COMPLETED;
    }
}