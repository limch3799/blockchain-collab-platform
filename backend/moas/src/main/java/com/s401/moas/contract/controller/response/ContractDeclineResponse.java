package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import lombok.Getter;

@Getter
public class ContractDeclineResponse {
    private final Long contractId;
    private final String status;

    private ContractDeclineResponse(Long contractId, String status) {
        this.contractId = contractId;
        this.status = status;
    }

    public static ContractDeclineResponse from(ContractStatusUpdateDto dto) {
        return new ContractDeclineResponse(dto.getContractId(), dto.getStatus().name());
    }
}