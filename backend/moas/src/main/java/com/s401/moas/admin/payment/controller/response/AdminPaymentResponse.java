package com.s401.moas.admin.payment.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.payment.service.dto.AdminPaymentDto;
import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.domain.PaymentStatus;
import com.s401.moas.payment.domain.PaymentType;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPaymentResponse {

    // Payment 정보
    private final Long paymentId;
    private final PaymentType paymentType;
    private final PaymentStatus paymentStatus;
    private final Long paymentAmount;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime completedAt;
    private final Integer primaryMemberId;

    // Order 정보
    private final String orderId;
    private final Long contractId;
    private final OrderStatus orderStatus;
    private final Integer payerMemberId;

    /**
     * Service DTO를 Response DTO로 변환하는 팩토리 메서드
     */
    public static AdminPaymentResponse from(AdminPaymentDto dto) {
        return AdminPaymentResponse.builder()
                .paymentId(dto.getPaymentId())
                .paymentType(dto.getPaymentType())
                .paymentStatus(dto.getPaymentStatus())
                .paymentAmount(dto.getPaymentAmount())
                .createdAt(dto.getCreatedAt())
                .completedAt(dto.getCompletedAt())
                .primaryMemberId(dto.getPrimaryMemberId())

                .orderId(dto.getOrderId())
                .contractId(dto.getContractId())
                .orderStatus(dto.getOrderStatus())
                .payerMemberId(dto.getPayerMemberId())
                .build();
    }
}