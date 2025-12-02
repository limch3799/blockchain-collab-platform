package com.s401.moas.payment.domain;

import com.s401.moas.global.domain.BaseTimeEntity;
import com.s401.moas.payment.exception.PaymentException;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "`order`")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseTimeEntity {

    @Id
    @Column(length = 64)
    private String id; // 주문 ID (merchant_uid)

    @Column(name = "contract_id", nullable = false, unique = true) // 한 계약당 하나의 주문
    private Long contractId;

    @Column(name = "member_id", nullable = false)
    private Integer memberId; // 결제자 회원 ID

    @Column(nullable = false)
    private Long amount; // 결제 요청 금액

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Setter
    @Column(name = "payment_key", length = 200)
    private String paymentKey; // 토스페이먼츠 결제 KEY

    @Builder
    public Order(String id, Long contractId, Integer memberId, Long amount) {
        this.id = id; // 테스트용
        this.contractId = contractId;
        this.memberId = memberId;
        this.amount = amount;
        this.status = OrderStatus.PENDING;
    }

    @Builder(builderMethodName = "testBuilder")
    public Order(String id, Long contractId, Integer memberId, Long amount, OrderStatus status, String paymentKey) {
        this.id = id;
        this.contractId = contractId;
        this.memberId = memberId;
        this.amount = amount;
        this.status = status;
        this.paymentKey = paymentKey;
    }

    public void setPaymentSuccess(String paymentKey) {
        if (this.status != OrderStatus.PENDING) {
            throw PaymentException.alreadyProcessedOrder();
        }
        this.paymentKey = paymentKey;
        this.status = OrderStatus.PAID;
    }

    public void setPaymentFailure() {
        if (this.status != OrderStatus.PENDING) {
            return; // 이미 처리된 주문의 상태를 FAILED로 덮어쓰지 않음
        }
        this.status = OrderStatus.FAILED;
    }

    /**
     * 결제가 완료된(PAID) 주문을 취소합니다.
     * 오직 'PAID' 상태에서만 호출 가능하며, 상태를 'CANCELED'로 변경합니다.
     */
    public void cancel() {
        // 1. 상태 전이 유효성 검증
        if (this.status != OrderStatus.PAID) {
            // 'PAID' 상태가 아닌 주문을 취소하려고 하면 예외를 발생시킵니다.
            throw PaymentException.cannotCancelInvalidOrderStatus();
        }

        // 2. 상태 변경
        this.status = OrderStatus.CANCELED;
    }

    public void partialCancel() {
        // 토스페이먼츠에서 사용하는 'PARTIAL_CANCELED'
        this.status = OrderStatus.PARTIAL_CANCELED;
    }
}