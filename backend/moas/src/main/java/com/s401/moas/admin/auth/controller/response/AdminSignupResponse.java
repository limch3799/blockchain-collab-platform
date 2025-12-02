package com.s401.moas.admin.auth.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.auth.service.dto.AdminSignupDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminSignupResponse {
    private final Integer adminId;
    private final String loginId;
    private final String name;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;

    public static AdminSignupResponse from(AdminSignupDto dto) {
        return AdminSignupResponse.builder()
                .adminId(dto.getAdminId())
                .loginId(dto.getLoginId())
                .name(dto.getName())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}