package com.s401.moas.contract.service.dto;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import lombok.Getter;

@Getter
public class ContractOfferResponseDto {
    private final Long contractId;
    private final Long applicationId;
    private final ContractStatus contractStatus;
    private final ApplicationStatus applicationStatus;

    private ContractOfferResponseDto(Long contractId, Long applicationId, ContractStatus contractStatus, ApplicationStatus applicationStatus) {
        this.contractId = contractId;
        this.applicationId = applicationId;
        this.contractStatus = contractStatus;
        this.applicationStatus = applicationStatus;
    }

    public static ContractOfferResponseDto of(Contract contract, Long applicationId, ApplicationStatus applicationStatus) {
        return new ContractOfferResponseDto(
                contract.getId(),
                applicationId,
                contract.getStatus(),
                applicationStatus
        );
    }
}