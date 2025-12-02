package com.s401.moas.member.controller.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.member.domain.MemberBank;

import lombok.Builder;
import lombok.Getter;

/**
 * 계좌 등록 응답 DTO
 */
@Getter
@Builder
public class CreateBankAccountResponse {

    private Long accountId;
    private String bankCode;
    private String bankName;
    private String accountHolderName;
    private String accountLast4;
    private String status;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public static CreateBankAccountResponse from(MemberBank memberBank, String bankName) {
        return CreateBankAccountResponse.builder()
                .accountId(memberBank.getId())
                .bankCode(memberBank.getBankCode())
                .bankName(bankName)
                .accountHolderName(memberBank.getAccountHolderName())
                .accountLast4(memberBank.getAccountLast4())
                .status(memberBank.getStatus().name())
                .createdAt(memberBank.getCreatedAt())
                .build();
    }
}

