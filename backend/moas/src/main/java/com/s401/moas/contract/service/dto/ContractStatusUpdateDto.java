package com.s401.moas.contract.service.dto;

import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import lombok.Getter;

@Getter
public class ContractStatusUpdateDto {
    private final Long contractId;
    private final ContractStatus status;

    private ContractStatusUpdateDto(Long contractId, ContractStatus status) {
        this.contractId = contractId;
        this.status = status;
    }

    public static ContractStatusUpdateDto from(Contract contract) {
        return new ContractStatusUpdateDto(contract.getId(), contract.getStatus());
    }
}