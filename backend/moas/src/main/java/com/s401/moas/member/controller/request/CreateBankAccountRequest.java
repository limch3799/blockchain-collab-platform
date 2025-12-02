package com.s401.moas.member.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 계좌 등록 요청 DTO
 */
@Getter
@NoArgsConstructor
public class CreateBankAccountRequest {

    @NotBlank(message = "은행 코드는 필수입니다.")
    @Size(min = 3, max = 3, message = "은행 코드는 3자리여야 합니다.")
    private String bankCode;

    @NotBlank(message = "예금주명은 필수입니다.")
    @Size(min = 1, max = 50, message = "예금주명은 1~50자여야 합니다.")
    private String accountHolderName;

    @NotBlank(message = "계좌번호는 필수입니다.")
    @Pattern(regexp = "^[0-9]+$", message = "계좌번호는 숫자만 입력 가능합니다.")
    @Size(min = 10, max = 20, message = "계좌번호는 10~20자여야 합니다.")
    private String accountNumber;
}

