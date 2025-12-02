package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import lombok.Getter;

@Getter
public class ContractAcceptResponse {
    private final Long contractId;
    private final String status;

    private ContractAcceptResponse(Long contractId, String status) {
        this.contractId = contractId;
        this.status = status;
    }

    public static ContractAcceptResponse from(ContractStatusUpdateDto dto) {
        return new ContractAcceptResponse(dto.getContractId(), dto.getStatus().name());
    }
}