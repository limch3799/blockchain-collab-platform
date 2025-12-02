package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import lombok.Getter;

@Getter
public class ContractUpdateResponse {
    private final Long contractId;
    private final String status;

    private ContractUpdateResponse(Long contractId, String status) {
        this.contractId = contractId;
        this.status = status;
    }

    public static ContractUpdateResponse from(ContractStatusUpdateDto dto) {
        return new ContractUpdateResponse(dto.getContractId(), dto.getStatus().name());
    }
}