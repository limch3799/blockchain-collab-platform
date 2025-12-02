package com.s401.moas.admin.feepolicy.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class FeePolicyHistoryDto {

    private final List<FeePolicyHistoryItemDto> policies;

    @Getter
    @Builder
    public static class FeePolicyHistoryItemDto {

        private final Integer policyId;
        private final BigDecimal feeRate;
        private final LocalDateTime startAt;
        private final LocalDateTime endAt;  // null 가능
        private final String adminName;
    }
}