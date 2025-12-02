package com.s401.moas.admin.feepolicy.controller.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FeePolicyUpdateRequest {

    @NotNull(message = "수수료율은 필수입니다")
    @DecimalMin(value = "0.00", message = "수수료율은 0% 이상이어야 합니다")
    @DecimalMax(value = "100.00", message = "수수료율은 100% 이하여야 합니다")
    @Digits(integer = 3, fraction = 2, message = "수수료율은 소수점 2자리까지 가능합니다")
    private BigDecimal feeRate;

    @NotNull(message = "적용 시작일은 필수입니다")
    @Future(message = "적용 시작일은 미래 날짜여야 합니다")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startAt;
}