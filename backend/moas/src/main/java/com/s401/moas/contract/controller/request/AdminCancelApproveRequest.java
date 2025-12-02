package com.s401.moas.contract.controller.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class AdminCancelApproveRequest {

    @Schema(description = "관리자가 남기는 내부 메모")
    private String adminMemo;

    @Min(value = 0, message = "작업 진행률은 0 이상이어야 합니다.")
    @Max(value = 1, message = "작업 진행률은 1 이하이어야 합니다.")
    @Schema(description = "관리자가 강제로 지정하는 아티스트의 작업 진행률 (0.0 ~ 1.0). " +
            "이 값을 보내면 일할 계산을 무시하고 이 비율로 정산합니다. 보내지 않으면 자동으로 일할 계산됩니다.")
    private BigDecimal artistWorkingRatio;
}