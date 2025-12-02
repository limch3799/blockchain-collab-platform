package com.s401.moas.admin.contract.controller.response;

import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import lombok.Getter;

@Getter
public class ContractStatusUpdateResponse {
    private final Long contractId;
    private final String newStatus;

    private ContractStatusUpdateResponse(Long contractId, String newStatus) {
        this.contractId = contractId;
        this.newStatus = newStatus;
    }

    public static ContractStatusUpdateResponse from(ContractStatusUpdateDto dto) {
        return new ContractStatusUpdateResponse(dto.getContractId(), dto.getStatus().name());
    }
}