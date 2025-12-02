package com.s401.moas.contract.domain;

import com.s401.moas.contract.controller.request.ContractUpdateRequest;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "contract")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contract extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Column(name = "leader_member_id", nullable = false)
    private Integer leaderMemberId;

    @Column(name = "artist_member_id", nullable = false)
    private Integer artistMemberId;

    @Setter
    @Column(length = 255)
    private String nftImageUrl;

    @Column(length = 100, nullable = false)
    private String title;

    @Lob // TEXT 타입 매핑
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Setter
    private ContractStatus status;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "applied_fee_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal appliedFeeRate;

    @Column(name = "leader_signature", length = 132)
    private String leaderSignature;

    @Column(name = "artist_signature", length = 132)
    private String artistSignature;

    @Builder
    public Contract(Integer projectId, Integer leaderMemberId, Integer artistMemberId, String title, String description, LocalDateTime startAt, LocalDateTime endAt, Long totalAmount, BigDecimal appliedFeeRate) {
        this.projectId = projectId;
        this.leaderMemberId = leaderMemberId;
        this.artistMemberId = artistMemberId;
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        this.totalAmount = totalAmount;
        this.appliedFeeRate = appliedFeeRate;
        this.status = ContractStatus.PENDING; // 초기 상태는 PENDING
    }

    @Builder(builderMethodName = "testBuilder")
    public Contract(Long id, ContractStatus status, Integer projectId, Integer leaderMemberId, Integer artistMemberId, String title, String description, LocalDateTime startAt, LocalDateTime endAt, Long totalAmount, BigDecimal appliedFeeRate) {
        this.id = id; // 테스트 용
        this.status = status; // 테스트 용
        this.projectId = projectId;
        this.leaderMemberId = leaderMemberId;
        this.artistMemberId = artistMemberId;
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        this.totalAmount = totalAmount;
        this.appliedFeeRate = appliedFeeRate;
    }

    /**
     * 아티스트가 계약을 거절합니다.
     * 계약의 상태가 PENDING일 때만 거절할 수 있습니다.
     */
    public void decline() {
        // 409 Conflict 조건: PENDING 상태가 아니면 처리 불가
        if (this.status != ContractStatus.PENDING) {
            throw ContractException.cannotProcessNotPending();
        }
        this.status = ContractStatus.DECLINED;
    }

    /**
     * 리더가 거절된 계약을 수정하여 재제시합니다.
     * 계약 상태가 DECLINED일 때만 가능하며, 상태를 PENDING으로 변경합니다.
     *
     * @param request 변경할 내용을 담은 요청 DTO
     */
    public void updateAndReoffer(ContractUpdateRequest request) {
        // 409 Conflict 조건: DECLINED 상태가 아니면 처리 불가
        if (this.status != ContractStatus.DECLINED) {
            throw ContractException.cannotReofferNotDeclined();
        }

        // DTO의 필드 업데이트
        this.description = request.getDescription();
        this.startAt = request.getStartAt();
        this.endAt = request.getEndAt();
        this.totalAmount = request.getTotalAmount();

        // 상태를 다시 PENDING으로 변경하여 아티스트의 결정을 기다립니다.
        this.status = ContractStatus.PENDING;
    }

    /**
     * 리더가 계약 제안을 철회합니다.
     * 계약 상태가 PENDING 또는 DECLINED일 때만 철회할 수 있습니다.
     */
    public void withdraw() {
        // 409 Conflict 조건: PENDING 또는 DECLINED 상태가 아니면 처리 불가
        if (this.status != ContractStatus.PENDING && this.status != ContractStatus.DECLINED && this.status != ContractStatus.ARTIST_SIGNED) {
            throw ContractException.cannotWithdrawInvalidStatus();
        }
        this.status = ContractStatus.WITHDRAWN;
    }

    /**
     * 아티스트가 계약을 수락하고 서명을 저장합니다.
     * 계약의 상태가 PENDING일 때만 수락할 수 있습니다.
     *
     * @param artistSignature 아티스트의 EIP-712 서명값
     */
    public void accept(String artistSignature) {
        // 409 Conflict 조건: PENDING 상태가 아니면 처리 불가
        if (this.status != ContractStatus.PENDING) {
            // 이전에 만든 예외 재사용
            throw ContractException.cannotProcessNotPending();
        }

        this.status = ContractStatus.ARTIST_SIGNED;
        this.artistSignature = artistSignature;
    }

    /**
     * 리더가 계약을 최종 체결하고 서명을 저장합니다.
     * 계약 상태가 ARTIST_SIGNED일 때만 체결할 수 있습니다.
     *
     * @param leaderSignature 리더의 EIP-712 서명값
     */
    public void finalizeContract(String leaderSignature) {
        // 409 Conflict 조건: ARTIST_SIGNED 상태가 아니면 처리 불가
        if (this.artistSignature == null) {
            throw ContractException.cannotFinalizeInvalidStatus();
        }

        this.status = ContractStatus.PAYMENT_PENDING; // 결제 대기 상태로 변경
        this.leaderSignature = leaderSignature;
    }

    /**
     * 리더가 계약금을 결제합니다.
     * 계약 상태가 PAYMENT_PENDING일 때만 결제할 수 있습니다.
     *
     */
    public void setPaymentCompleted() {
        if (this.status != ContractStatus.PAYMENT_PENDING) {
            // 이미 처리되었거나 잘못된 상태 변경 시도를 로그로 남기거나 예외 처리
            throw ContractException.invalidStatusTransition();
        }
        this.status = ContractStatus.PAYMENT_COMPLETED;
    }

    /**
     * 계약의 최종 이행을 완료하고 상태를 'COMPLETED'로 변경합니다. (구매 확정 시 호출)
     * 오직 'PAYMENT_COMPLETED' 상태에서만 호출 가능합니다.
     */
    public void complete() {
        // 1. 상태 전이(State Transition) 유효성 검증
        if (this.status != ContractStatus.PAYMENT_COMPLETED) {
            // 다른 상태에서 complete를 시도하면 예외를 발생시켜 데이터를 보호합니다.
            throw ContractException.cannotCompleteInvalidStatus();
        }

        // 2. 상태 변경
        this.status = ContractStatus.COMPLETED;
    }

    /**
     * 계약 취소를 요청하고 상태를 'CANCELLATION_REQUESTED'로 변경합니다.
     */
    public void requestCancellation() {
        List<ContractStatus> cancellableStatus = Arrays.asList(
                ContractStatus.PAYMENT_COMPLETED,
                ContractStatus.CANCELLATION_REQUESTED // 중복 요청도 허용 (내용 덮어쓰기)
        );
        if (!cancellableStatus.contains(this.status)) {
            throw ContractException.cannotCancelInvalidStatus();
        }
        this.status = ContractStatus.CANCELLATION_REQUESTED;
    }

    /**
     * 관리자가 계약 취소를 최종 승인하고 상태를 'CANCELED'로 변경합니다.
     */
    public void approveCancellation() {
        if (this.status != ContractStatus.CANCELLATION_REQUESTED) {
            throw ContractException.cannotApproveCancellationInvalidStatus();
        }
        this.status = ContractStatus.CANCELED;
    }

    /**
     * 관리자가 계약 취소를 반려하고 상태를 'PAYMENT_COMPLETED'으로 되돌립니다.
     */
    public void rejectCancellation() {
        if (this.status != ContractStatus.CANCELLATION_REQUESTED) {
            throw ContractException.cannotApproveCancellationInvalidStatus();
        }
        this.status = ContractStatus.PAYMENT_COMPLETED;
    }
}