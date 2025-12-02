package com.s401.moas.admin.member.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemberPenaltyListDto {
    private final List<PenaltyItemDto> penalties;

    @Getter
    @Builder
    public static class PenaltyItemDto {
        private final Long id;
        private final Integer memberId;
        private final Long contractId;
        private final Integer changedBy;
        private final Integer penaltyScore;
        private final LocalDateTime createdAt;
        private final LocalDateTime changedAt;
    }
}