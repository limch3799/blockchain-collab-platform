package com.s401.moas.admin.auth.controller.response;

import com.s401.moas.admin.auth.service.dto.AdminTokenDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminTokenResponse {
    private final String accessToken;
    private final String refreshToken;

    public static AdminTokenResponse from(AdminTokenDto dto) {
        return AdminTokenResponse.builder()
                .accessToken(dto.getAccessToken())
                .refreshToken(dto.getRefreshToken())
                .build();
    }
}