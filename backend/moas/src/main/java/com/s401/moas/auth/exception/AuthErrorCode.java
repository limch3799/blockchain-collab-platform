package com.s401.moas.auth.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements BaseErrorCode {

    // === 클라이언트 오류 (4xx) ===
    // 401 UNAUTHORIZED: 만료·무효·위조된 RT
    // 내부 로직 노출 방지를 위해 HTTP 상태 코드 기반으로 에러 코드 통일
    INVALID_ARGUMENTS(
            "BAD_REQUEST", "잘못된 파라미터입니다.", HttpStatus.BAD_REQUEST
    ),
    INVALID_ID_TOKEN(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    REFRESH_TOKEN_COOKIE_NOT_FOUND(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    REFRESH_TOKEN_EXPIRED(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    REFRESH_TOKEN_INVALID(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    SESSION_BLOCKED(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    
    // Access Token 관련
    ACCESS_TOKEN_NOT_FOUND(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    ACCESS_TOKEN_EXPIRED(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),
    ACCESS_TOKEN_INVALID(
            "UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED
    ),

    // 403 FORBIDDEN: 권한 부족
    FORBIDDEN(
            "FORBIDDEN", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN
    ),
    
    // 409 CONFLICT: RT 패밀리 불일치(도난 의심)
    REFRESH_TOKEN_REUSE_DETECTED(
            "CONFLICT", "세션이 만료되었습니다. 다시 로그인해 주세요.", HttpStatus.CONFLICT
    );

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    @Override
    public String getCode() {
        return this.code;
    }

    @Override
    public String getMessage() {
        return this.message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return this.httpStatus;
    }
}

