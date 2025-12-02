package com.s401.moas.contract.exception;

import com.s401.moas.global.exception.base.BaseException;

public class ContractException extends BaseException {
    public ContractException(ContractErrorCode errorCode) {
        super(errorCode);
    }

    public ContractException(ContractErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public static ContractException contractNotFound() {
        return new ContractException(ContractErrorCode.CONTRACT_NOT_FOUND);
    }

    public static ContractException contractAccessDenied() {
        return new ContractException(ContractErrorCode.CONTRACT_ACCESS_DENIED);
    }

    public static ContractException cannotProcessNotPending() {
        return new ContractException(ContractErrorCode.CANNOT_PROCESS_NOT_PENDING);
    }

    public static ContractException cannotReofferNotDeclined(){
        return new ContractException(ContractErrorCode.CANNOT_REOFFER_NOT_DECLINED);
    }

    public static ContractException cannotWithdrawInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_WITHDRAW_INVALID_STATUS);
    }

    public static ContractException cannotFinalizeInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_FINALIZE_INVALID_STATUS);
    }

    public static ContractException signatureInvalid() {
        return new ContractException(ContractErrorCode.SIGNATURE_INVALID);
    }

    public static ContractException invalidStatusTransition() {
        return new ContractException(ContractErrorCode.INVALID_STATUS_TRANSITION);
    }

    public static ContractException cannotConfirmInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_CONFIRM_INVALID_STATUS);
    }

    public static ContractException cannotCompleteInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_COMPLETE_INVALID_STATUS);
    }

    public static ContractException cannotCancelInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_CANCEL_INVALID_STATUS);
    }

    public static ContractException cannotApproveCancellationInvalidStatus() {
        return new ContractException(ContractErrorCode.CANNOT_APPROVE_CANCELLATION_INVALID_STATUS);
    }

    public static ContractException actionLogNotFound(String details) {
        String formattedMessage = String.format("필수 활동 기록을 찾을 수 없습니다. (%s)", details);
        return new ContractException(ContractErrorCode.ACTION_LOG_NOT_FOUND, formattedMessage);
    }

    public static ContractException invalidStatusParameter() {
        return new ContractException(ContractErrorCode.INVALID_STATUS_PARAMETER);
    }
}