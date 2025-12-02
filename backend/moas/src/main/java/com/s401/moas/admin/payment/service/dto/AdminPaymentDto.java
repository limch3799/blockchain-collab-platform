package com.s401.moas.admin.payment.service.dto;

import com.s401.moas.payment.repository.projection.PaymentProjection;
import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.domain.PaymentStatus;
import com.s401.moas.payment.domain.PaymentType;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPaymentDto {

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

    /**
     * Projection DTO를 Service DTO로 변환하는 팩토리 메서드
     */
    public static AdminPaymentDto from(PaymentProjection projection) {
        return AdminPaymentDto.builder()
                .paymentId(projection.getPaymentId())
                .paymentType(projection.getPaymentType())
                .paymentStatus(projection.getPaymentStatus())
                .paymentAmount(projection.getPaymentAmount())
                .createdAt(projection.getCreatedAt())
                .completedAt(projection.getCompletedAt())
                .primaryMemberId(projection.getPrimaryMemberId())

                .orderId(projection.getOrderId())
                .contractId(projection.getContractId())
                .orderStatus(projection.getOrderStatus())
                .payerMemberId(projection.getPayerMemberId())
                .build();
    }
}