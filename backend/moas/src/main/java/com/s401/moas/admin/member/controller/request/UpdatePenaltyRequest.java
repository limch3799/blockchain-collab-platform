package com.s401.moas.admin.member.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdatePenaltyRequest {

    @NotNull(message = "페널티 점수는 필수입니다.")
    private Integer penaltyScore;

    @NotBlank(message = "사유는 필수입니다.")
    private String reason;

    private Long contractId;
}