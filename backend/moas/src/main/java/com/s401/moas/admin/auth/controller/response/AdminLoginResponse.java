package com.s401.moas.admin.auth.controller.response;

import com.s401.moas.admin.auth.service.dto.AdminLoginDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminLoginResponse {
    private final String accessToken;
    private final String refreshToken;
    private final String name;
    private final Integer adminId;

    public static AdminLoginResponse from(AdminLoginDto dto) {
        return AdminLoginResponse.builder()
                .accessToken(dto.getAccessToken())
                .refreshToken(dto.getRefreshToken())
                .name(dto.getName())
                .adminId(dto.getAdminId())
                .build();
    }
}