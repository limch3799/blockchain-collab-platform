package com.s401.moas.admin.contract.controller.response;

import com.s401.moas.admin.contract.service.dto.ContractStatisticsDto;
import com.s401.moas.contract.domain.ContractStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
@Schema(description = "계약 통계 응답")
public class ContractStatisticsResponse {

    @Schema(description = "상태별 계약 건수")
    private Map<String, Long> statusCounts;

    public static ContractStatisticsResponse from(ContractStatisticsDto dto) {
        Map<String, Long> counts = dto.getStatusCounts().entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().name(),
                        Map.Entry::getValue
                ));

        return new ContractStatisticsResponse(counts);
    }
}