package com.s401.moas.admin.auth.service.dto;

import com.s401.moas.admin.auth.domain.Admin;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminSignupDto {
    private final Integer adminId;
    private final String loginId;
    private final String name;
    private final LocalDateTime createdAt;

    public static AdminSignupDto from(Admin admin) {
        return AdminSignupDto.builder()
                .adminId(admin.getId())
                .loginId(admin.getLoginId())
                .name(admin.getName())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}