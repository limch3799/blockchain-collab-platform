package com.s401.moas.admin.member.exception;

import com.s401.moas.global.exception.base.BaseException;

public class AdminMemberException extends BaseException {

    public AdminMemberException(AdminMemberErrorCode errorCode) {
        super(errorCode);
    }

    public AdminMemberException(AdminMemberErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public AdminMemberException(AdminMemberErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    // Static factory methods
    public static AdminMemberException invalidParameter(String paramName, String detail) {
        return new AdminMemberException(
                AdminMemberErrorCode.INVALID_PARAMETER,
                paramName + ": " + detail
        );
    }

    public static AdminMemberException memberNotFound() {
        return new AdminMemberException(AdminMemberErrorCode.MEMBER_NOT_FOUND);
    }

    public static AdminMemberException memberAlreadyDeleted() {
        return new AdminMemberException(AdminMemberErrorCode.MEMBER_ALREADY_DELETED);
    }
}