package com.s401.moas.contract.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class GenerateContractRequest {
    @NotNull(message = "프로젝트 포지션 ID는 필수입니다.")
    private Long projectPositionId;

    @NotBlank(message = "계약서 제목은 필수입니다.")
    private String title;

    @NotNull(message = "계약 금액은 필수입니다.")
    private Long totalAmount;

    @NotNull(message = "계약 시작일은 필수입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "계약 종료일은 필수입니다.")
    private LocalDateTime endAt;

    // 사용자가 추가로 전달하고 싶은 내용 (선택)
    private String additionalDetails;
}