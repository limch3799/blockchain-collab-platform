package com.s401.moas.auth.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Web3Auth 회원 정보 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Web3AuthMemberDto {
    private String providerId;
    private String provider;
    private String walletAddress;
}

