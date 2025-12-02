package com.s401.moas.admin.auth.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminTokenDto {
    private final String accessToken;
    private final String refreshToken;
}