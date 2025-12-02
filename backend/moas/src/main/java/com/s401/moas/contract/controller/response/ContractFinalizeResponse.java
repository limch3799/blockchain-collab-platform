package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.service.dto.ContractFinalizeResponseDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractFinalizeResponse {
    private final Long contractId;
    private final String status;
    private final PaymentInfo paymentInfo;

    // --- 수정된 부분: PaymentInfo 내부 클래스 ---
    @Getter
    @Builder
    public static class PaymentInfo {
        // 프론트엔드 JS SDK에 필요한 정보들
        private final String orderId;
        private final Long amount;
        private final String productName;
        private final String customerName;
    }

    public static ContractFinalizeResponse from(ContractFinalizeResponseDto dto) { // DTO 이름 변경
        PaymentInfo paymentInfo = PaymentInfo.builder()
                .orderId(dto.getPaymentInfo().getOrderId())
                .amount(dto.getPaymentInfo().getAmount())
                .productName(dto.getPaymentInfo().getProductName())
                .customerName(dto.getPaymentInfo().getCustomerName())
                .build();

        return ContractFinalizeResponse.builder()
                .contractId(dto.getContractId())
                .status(dto.getStatus().name())
                .paymentInfo(paymentInfo)
                .build();
    }
}