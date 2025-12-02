package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractConfirmResponse {
    private Long contractId;
    private ContractStatus status; // Enum 타입을 직접 사용

    public static ContractConfirmResponse from(ContractStatusUpdateDto dto) {
        return ContractConfirmResponse.builder()
                .contractId(dto.getContractId())
                .status(dto.getStatus())
                .build();
    }
}