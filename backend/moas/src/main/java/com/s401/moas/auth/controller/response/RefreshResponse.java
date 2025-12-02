package com.s401.moas.auth.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Refresh Token 재발급 응답 DTO
 * Refresh Token은 쿠키로 전송되므로 응답에는 Access Token만 포함
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshResponse {
    private String accessToken;
}

