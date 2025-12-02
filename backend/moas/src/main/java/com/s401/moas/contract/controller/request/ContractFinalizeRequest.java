package com.s401.moas.contract.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContractFinalizeRequest {

    @NotBlank(message = "리더 서명값은 필수입니다.")
    private String leaderSignature;

    private String nftImageUrl;
}