package com.s401.moas.admin.auth.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminLoginDto {
    private final String accessToken;
    private final String refreshToken;
    private final String name;
    private final Integer adminId;
}