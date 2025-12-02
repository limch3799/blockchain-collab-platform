package com.s401.moas.application.controller.response;

import com.s401.moas.contract.service.dto.ContractOfferResponseDto;
import lombok.Getter;

@Getter
public class ContractOfferResponse {
    private final Long contractId;
    private final Long applicationId;
    private final String contractStatus;
    private final String applicationStatus;

    private ContractOfferResponse(Long contractId, Long applicationId, String contractStatus, String applicationStatus) {
        this.contractId = contractId;
        this.applicationId = applicationId;
        this.contractStatus = contractStatus;
        this.applicationStatus = applicationStatus;
    }

    public static ContractOfferResponse from(ContractOfferResponseDto dto) {
        return new ContractOfferResponse(
                dto.getContractId(),
                dto.getApplicationId(),
                dto.getContractStatus().name(),
                dto.getApplicationStatus().name()
        );
    }
}