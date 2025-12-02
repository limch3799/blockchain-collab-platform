package com.s401.moas.application.controller.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApplicationCreateRequest {
    @NotNull(message = "프로젝트 직무 ID는 필수입니다.")
    private Long projectPositionId;

    @NotNull(message = "포트폴리오 ID는 필수입니다.")
    private Long portfolioId;

    @Size(max = 100, message = "지원 메시지는 100자 이하로 입력해주세요.")
    private String message; // 선택사항
}
