package com.s401.moas.admin.member.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdatePenaltyDto {
    private final Integer memberId;
    private final Integer previousPenaltyScore;
    private final Integer newPenaltyScore;
    private final Integer changedScore;
    private final String reason;
}