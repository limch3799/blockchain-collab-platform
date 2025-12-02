package com.s401.moas.admin.contract.service.dto;

import com.s401.moas.contract.domain.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class ContractStatisticsDto {
    private Map<ContractStatus, Long> statusCounts;
}