package com.s401.moas.admin.member.controller.response;

import com.s401.moas.admin.member.service.dto.UpdatePenaltyDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdatePenaltyResponse {
    private final Integer memberId;
    private final Integer previousPenaltyScore;
    private final Integer newPenaltyScore;
    private final Integer changedScore;
    private final String reason;

    public static UpdatePenaltyResponse from(UpdatePenaltyDto dto) {
        return UpdatePenaltyResponse.builder()
                .memberId(dto.getMemberId())
                .previousPenaltyScore(dto.getPreviousPenaltyScore())
                .newPenaltyScore(dto.getNewPenaltyScore())
                .changedScore(dto.getChangedScore())
                .reason(dto.getReason())
                .build();
    }
}