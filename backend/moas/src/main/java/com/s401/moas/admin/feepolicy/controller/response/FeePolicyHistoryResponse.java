package com.s401.moas.admin.feepolicy.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyHistoryDto;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class FeePolicyHistoryResponse {

    private final List<FeePolicyHistoryItemResponse> policies;

    public static FeePolicyHistoryResponse from(FeePolicyHistoryDto dto) {
        return FeePolicyHistoryResponse.builder()
                .policies(dto.getPolicies().stream()
                        .map(FeePolicyHistoryItemResponse::from)
                        .toList())
                .build();
    }

    @Getter
    @Builder
    public static class FeePolicyHistoryItemResponse {

        private final Integer policyId;
        private final BigDecimal feeRate;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime startAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime endAt;  // null 가능

        private final String adminName;

        public static FeePolicyHistoryItemResponse from(FeePolicyHistoryDto.FeePolicyHistoryItemDto dto) {
            return FeePolicyHistoryItemResponse.builder()
                    .policyId(dto.getPolicyId())
                    .feeRate(dto.getFeeRate())
                    .startAt(dto.getStartAt())
                    .endAt(dto.getEndAt())
                    .adminName(dto.getAdminName())
                    .build();
        }
    }
}