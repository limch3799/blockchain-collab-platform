package com.s401.moas.admin.feepolicy.service.dto;

import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.feepolicy.domain.FeePolicy;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class FeePolicyUpdateDto {

    private final Integer policyId;
    private final BigDecimal feeRate;
    private final LocalDateTime startAt;
    private final String adminName;

    public static FeePolicyUpdateDto of(FeePolicy policy, Admin admin) {
        return FeePolicyUpdateDto.builder()
                .policyId(policy.getId())
                .feeRate(policy.getFeeRate())
                .startAt(policy.getStartAt())
                .adminName(admin.getName())
                .build();
    }
}