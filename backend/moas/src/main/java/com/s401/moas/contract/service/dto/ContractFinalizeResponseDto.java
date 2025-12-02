package com.s401.moas.contract.service.dto;

import com.s401.moas.contract.domain.ContractStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractFinalizeResponseDto {
    private final Long contractId;
    private final ContractStatus status;
    private final PaymentInfo paymentInfo;

    @Getter
    @Builder
    public static class PaymentInfo {
        private final String orderId;
        private final Long amount;
        private final String productName;
        private final String customerName;
    }
}
