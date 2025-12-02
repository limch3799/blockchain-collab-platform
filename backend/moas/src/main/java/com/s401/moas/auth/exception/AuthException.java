package com.s401.moas.auth.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Auth 도메인 예외
 */
public class AuthException extends BaseException {

    public AuthException(AuthErrorCode errorCode) {
        super(errorCode);
    }

    public AuthException(AuthErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public AuthException(AuthErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public AuthException(AuthErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================
    public static AuthException invalidArguments() {
        return new AuthException(AuthErrorCode.INVALID_ARGUMENTS);
    }
    public static AuthException invalidIdToken() {
        return new AuthException(AuthErrorCode.INVALID_ID_TOKEN);
    }

    public static AuthException invalidIdToken(Throwable cause) {
        return new AuthException(AuthErrorCode.INVALID_ID_TOKEN, cause);
    }

    public static AuthException refreshTokenCookieNotFound() {
        return new AuthException(AuthErrorCode.REFRESH_TOKEN_COOKIE_NOT_FOUND);
    }

    public static AuthException refreshTokenExpired() {
        return new AuthException(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    public static AuthException refreshTokenInvalid() {
        return new AuthException(AuthErrorCode.REFRESH_TOKEN_INVALID);
    }

    public static AuthException refreshTokenReuseDetected() {
        return new AuthException(AuthErrorCode.REFRESH_TOKEN_REUSE_DETECTED);
    }

    public static AuthException sessionBlocked() {
        return new AuthException(AuthErrorCode.SESSION_BLOCKED);
    }

    public static AuthException accessTokenNotFound() {
        return new AuthException(AuthErrorCode.ACCESS_TOKEN_NOT_FOUND);
    }

    public static AuthException accessTokenExpired() {
        return new AuthException(AuthErrorCode.ACCESS_TOKEN_EXPIRED);
    }

    public static AuthException accessTokenInvalid() {
        return new AuthException(AuthErrorCode.ACCESS_TOKEN_INVALID);
    }

    public static AuthException forbidden() {
        return new AuthException(AuthErrorCode.FORBIDDEN);
    }
}

