package com.s401.moas.application.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Application 도메인 예외
 */
public class ApplicationException extends BaseException {

    public ApplicationException(ApplicationErrorCode errorCode) {
        super(errorCode);
    }

    public ApplicationException(ApplicationErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    public static ApplicationException leaderCannotApply() {
        return new ApplicationException(ApplicationErrorCode.LEADER_CANNOT_APPLY);
    }

    public static ApplicationException alreadyApplied() {
        return new ApplicationException(ApplicationErrorCode.ALREADY_APPLIED);
    }

    public static ApplicationException applicationNotFound() {
        return new ApplicationException(ApplicationErrorCode.APPLICATION_NOT_FOUND);
    }

    public static ApplicationException applicationAccessDenied() {
        return new ApplicationException(ApplicationErrorCode.APPLICATION_ACCESS_DENIED);
    }

    public static ApplicationException cannotCancelNotPending() {
        return new ApplicationException(ApplicationErrorCode.CANNOT_CANCEL_NOT_PENDING);
    }

    public static ApplicationException notProjectLeader() {
        return new ApplicationException(ApplicationErrorCode.NOT_PROJECT_LEADER);
    }

    public static ApplicationException cannotProcessNotPending() {
        return new ApplicationException(ApplicationErrorCode.CANNOT_PROCESS_NOT_PENDING);
    }

    public static ApplicationException cannotCompleteNotOffered() {
        return new ApplicationException(ApplicationErrorCode.CANNOT_COMPLETE_NOT_OFFERED);
    }

    public static ApplicationException contractIdMustNotBeNullForOffer() {
        return new ApplicationException(ApplicationErrorCode.CONTRACT_ID_REQUIRED);
    }

    public static ApplicationException applicationClosed(){
        return new ApplicationException(ApplicationErrorCode.APPLICATION_CLOSED);
    }

    public static ApplicationException invalidApplicationStatus() {
        return new ApplicationException(ApplicationErrorCode.INVALID_APPLICATION_STATUS);
    }

    public static ApplicationException notOwnerApplication(){
        return new ApplicationException(ApplicationErrorCode.NOT_OWNER_APPLICATION);
    }
}