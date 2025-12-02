package com.s401.moas.admin.auth.exception;

import lombok.Getter;

@Getter
public class AdminAuthException extends RuntimeException {

    private final AdminAuthErrorCode errorCode;

    public AdminAuthException(AdminAuthErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AdminAuthException(AdminAuthErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    // Static factory methods
    public static AdminAuthException adminNotFound() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_NOT_FOUND);
    }

    public static AdminAuthException loginIdDuplicated() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_LOGIN_ID_DUPLICATED);
    }

    public static AdminAuthException invalidPassword() {
        return new AdminAuthException(AdminAuthErrorCode.INVALID_PASSWORD);
    }

    public static AdminAuthException adminDeleted() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_DELETED);
    }

    public static AdminAuthException forbidden() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_FORBIDDEN);
    }

    public static AdminAuthException refreshTokenNotFound() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_REFRESH_TOKEN_NOT_FOUND);
    }

    public static AdminAuthException refreshTokenInvalid() {
        return new AdminAuthException(AdminAuthErrorCode.ADMIN_REFRESH_TOKEN_INVALID);
    }
}