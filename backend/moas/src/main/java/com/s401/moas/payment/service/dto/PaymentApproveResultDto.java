package com.s401.moas.payment.service.dto;

import com.s401.moas.payment.domain.Order;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentApproveResultDto {
    private String orderId;
    private Long contractId;
    private String status;

    public static PaymentApproveResultDto from(Order order) {
        return PaymentApproveResultDto.builder()
                .orderId(order.getId())
                .contractId(order.getContractId())
                .status(order.getStatus().name())
                .build();
    }
}