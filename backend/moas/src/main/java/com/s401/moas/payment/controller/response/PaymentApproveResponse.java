package com.s401.moas.payment.controller.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentApproveResponse {
    private String orderId;
    private Long contractId;
    private String status;
}