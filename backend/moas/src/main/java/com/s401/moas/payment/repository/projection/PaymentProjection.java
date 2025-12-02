package com.s401.moas.payment.repository.projection;

import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.domain.PaymentStatus;
import com.s401.moas.payment.domain.PaymentType;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
// JPQL Projection에서 직접 호출되므로, 필드명과 생성자 순서가 JPQL과 일치해야 함
public class PaymentProjection {

    private final Long paymentId;
    private final PaymentType paymentType;
    private final PaymentStatus paymentStatus;
    private final Long paymentAmount;
    private final LocalDateTime createdAt;
    private final LocalDateTime completedAt;
    private final Integer primaryMemberId;

    private final String orderId;
    private final Long contractId;
    private final OrderStatus orderStatus;
    private final Integer payerMemberId;

    // JPQL Projection 생성자
    public PaymentProjection(
            Long paymentId, PaymentType paymentType, PaymentStatus paymentStatus, Long paymentAmount,
            LocalDateTime createdAt, LocalDateTime completedAt, Integer primaryMemberId,
            String orderId, Long contractId, OrderStatus orderStatus, Integer payerMemberId) {

        this.paymentId = paymentId;
        this.paymentType = paymentType;
        this.paymentStatus = paymentStatus;
        this.paymentAmount = paymentAmount;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.primaryMemberId = primaryMemberId;

        this.orderId = orderId;
        this.contractId = contractId;
        this.orderStatus = orderStatus;
        this.payerMemberId = payerMemberId;
    }
}