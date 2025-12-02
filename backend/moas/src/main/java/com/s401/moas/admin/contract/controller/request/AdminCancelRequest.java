package com.s401.moas.admin.contract.controller.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class AdminCancelRequest {
    @NotBlank(message = "관리자 메모는 필수입니다.")
    private String adminMemo;

    @DecimalMin(value = "0.0", inclusive = true, message = "작업 진행률은 0.0 이상이어야 합니다.")
    @DecimalMax(value = "1.0", inclusive = true, message = "작업 진행률은 1.0 이하여야 합니다.")
    private BigDecimal artistWorkingRatio;
}