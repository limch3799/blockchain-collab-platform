package com.s401.moas.admin.auth.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AdminAuthErrorCode {

    // 인증 관련
    ADMIN_NOT_FOUND(HttpStatus.NOT_FOUND, "ADMIN_001", "존재하지 않는 관리자입니다."),
    ADMIN_LOGIN_ID_DUPLICATED(HttpStatus.CONFLICT, "ADMIN_002", "이미 사용 중인 로그인 ID입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "ADMIN_003", "비밀번호가 일치하지 않습니다."),
    ADMIN_DELETED(HttpStatus.FORBIDDEN, "ADMIN_004", "삭제된 관리자 계정입니다."),

    // 권한 관련
    ADMIN_FORBIDDEN(HttpStatus.FORBIDDEN, "ADMIN_100", "관리자 권한이 필요합니다."),

    // 토큰 관련
    ADMIN_REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "ADMIN_200", "Refresh Token이 존재하지 않습니다."),
    ADMIN_REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "ADMIN_201", "유효하지 않은 Refresh Token입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}