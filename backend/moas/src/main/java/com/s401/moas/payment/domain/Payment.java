package com.s401.moas.payment.domain;

import com.s401.moas.payment.exception.PaymentException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status; // 거래 상태 (정산 지급 상태)

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // 거래 완료(지급 완료) 일시

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Payment(String orderId, Integer memberId, Long amount, PaymentType type, PaymentStatus status, LocalDateTime completedAt) {
        this.orderId = orderId;
        this.memberId = memberId;
        this.amount = amount;
        this.type = type;
        this.status = status;
        this.completedAt = completedAt;
    }

    // --- 상태 변경을 위한 편의 메서드 ---

    /**
     * 정산 지급이 완료되었을 때 호출하는 메서드.
     * 관리자 페이지 등에서 수동 처리 후 사용됩니다.
     */
    public void completeSettlement() {
        // 1. 타입 검증
        if (this.type != PaymentType.SETTLEMENT) {
            throw PaymentException.invalidPaymentTypeForStatusChange();
        }
        // 2. 현재 상태 검증 (중복 처리 방지)
        if (this.status != PaymentStatus.PENDING) {
            throw PaymentException.cannotCompleteAlreadyProcessedPayment();
        }
        // 3. 상태 변경
        this.status = PaymentStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }
}