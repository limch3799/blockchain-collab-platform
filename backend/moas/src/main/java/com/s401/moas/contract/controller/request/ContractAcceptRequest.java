package com.s401.moas.contract.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor // 역직렬화를 위한 기본 생성자
public class ContractAcceptRequest {

    @NotBlank(message = "아티스트 서명값은 필수입니다.")
    private String artistSignature;
}