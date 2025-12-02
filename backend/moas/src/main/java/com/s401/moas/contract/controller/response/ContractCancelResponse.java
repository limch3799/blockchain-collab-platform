package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractCancelResponse {
    @Schema(description = "취소 요청된 계약 ID")
    private Long contractId;

    @Schema(description = "변경 후 계약 상태")
    private ContractStatus status;

    public static ContractCancelResponse from(ContractStatusUpdateDto dto) {
        return ContractCancelResponse.builder()
                .contractId(dto.getContractId())
                .status(dto.getStatus())
                .build();
    }
}