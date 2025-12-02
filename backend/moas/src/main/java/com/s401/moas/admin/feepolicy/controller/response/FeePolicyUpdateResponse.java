package com.s401.moas.admin.feepolicy.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyUpdateDto;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class FeePolicyUpdateResponse {

    private final Integer policyId;
    private final BigDecimal feeRate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime startAt;

    private final String adminName;

    public static FeePolicyUpdateResponse from(FeePolicyUpdateDto dto) {
        return FeePolicyUpdateResponse.builder()
                .policyId(dto.getPolicyId())
                .feeRate(dto.getFeeRate())
                .startAt(dto.getStartAt())
                .adminName(dto.getAdminName())
                .build();
    }
}