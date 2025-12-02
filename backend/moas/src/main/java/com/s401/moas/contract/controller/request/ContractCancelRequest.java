package com.s401.moas.contract.controller.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContractCancelRequest {
    @NotBlank(message = "취소 사유는 필수입니다.")
    @Schema(description = "계약 취소 요청 사유", example = "아티스트와의 상호 합의 하에 취소를 요청합니다.")
    private String reason;
}