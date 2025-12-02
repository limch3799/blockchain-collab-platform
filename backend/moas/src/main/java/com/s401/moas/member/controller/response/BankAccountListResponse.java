package com.s401.moas.member.controller.response;

import java.util.List;
import java.util.stream.Collectors;

import com.s401.moas.member.domain.MemberBank;

import lombok.Builder;
import lombok.Getter;

/**
 * 계좌 목록 조회 응답 DTO
 */
@Getter
@Builder
public class BankAccountListResponse {

    private List<BankAccountResponse> accounts;

    public static BankAccountListResponse from(List<MemberBank> memberBanks, 
                                               java.util.function.Function<String, String> bankNameResolver) {
        List<BankAccountResponse> accounts = memberBanks.stream()
                .map(memberBank -> {
                    String bankName = bankNameResolver.apply(memberBank.getBankCode());
                    return BankAccountResponse.from(memberBank, bankName);
                })
                .collect(Collectors.toList());

        return BankAccountListResponse.builder()
                .accounts(accounts)
                .build();
    }
}

