package com.s401.moas.admin.auth.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminRefreshRequest {

    @NotBlank(message = "Refresh Token은 필수입니다")
    private String refreshToken;
}