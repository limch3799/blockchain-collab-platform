package com.s401.moas.contract.controller.request;

import com.s401.moas.global.validation.DateRange;
import com.s401.moas.global.validation.ValidDateRange;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@ValidDateRange // 계약 시작-종료일 유효성 검증하는 커스텀 Annotation
public class ContractUpdateRequest implements DateRange {
    private String description; // 계약 설명은 선택사항

    @NotNull(message = "계약 시작일은 필수입니다.")
    @FutureOrPresent(message = "계약 시작일은 현재 또는 미래 시점이어야 합니다.")
    private LocalDateTime startAt;

    @NotNull(message = "계약 종료일은 필수입니다.")
    private LocalDateTime endAt;

    @NotNull(message = "총 계약금액은 필수입니다.")
    @Positive(message = "총 계약금액은 양수여야 합니다.")
    private Long totalAmount;
}