package com.s401.moas.payment.exception;

import com.s401.moas.global.exception.base.BaseException;

public class PaymentException extends BaseException {

    public PaymentException(PaymentErrorCode errorCode) {
        super(errorCode);
    }

    public PaymentException(PaymentErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    // Client Errors
    public static PaymentException orderNotFound() {
        return new PaymentException(PaymentErrorCode.ORDER_NOT_FOUND);
    }
    public static PaymentException amountMismatch() {
        return new PaymentException(PaymentErrorCode.AMOUNT_MISMATCH);
    }
    public static PaymentException alreadyProcessedOrder() {
        return new PaymentException(PaymentErrorCode.ALREADY_PROCESSED_ORDER);
    }

    public static PaymentException cannotCancelInvalidOrderStatus() {
        return new PaymentException(PaymentErrorCode.CANNOT_CANCEL_INVALID_ORDER_STATUS);
    }

    // Server Errors
    public static PaymentException relatedContractNotFound() {
        return new PaymentException(PaymentErrorCode.RELATED_CONTRACT_NOT_FOUND);
    }
    public static PaymentException tossApiError() {
        return new PaymentException(PaymentErrorCode.TOSS_API_ERROR);
    }
    public static PaymentException paymentApprovalFailed(Object... args) {
        return new PaymentException(PaymentErrorCode.PAYMENT_APPROVAL_FAILED, args);
    }

    public static PaymentException relatedApplicationNotFound(Long contractId) {
        String message = String.format("계약(ID: %d)에 연결된 원본 지원서를 찾을 수 없습니다.", contractId);
        return new PaymentException(PaymentErrorCode.RELATED_APPLICATION_NOT_FOUND, message);
    }

    public static PaymentException invalidPaymentTypeForStatusChange() {
        return new PaymentException(PaymentErrorCode.INVALID_PAYMENT_TYPE_FOR_STATUS_CHANGE);
    }

    public static PaymentException cannotCompleteAlreadyProcessedPayment() {
        return new PaymentException(PaymentErrorCode.CANNOT_COMPLETE_ALREADY_PROCESSED_PAYMENT);
    }

    public static PaymentException relatedOrderNotFound() {
        return new PaymentException(PaymentErrorCode.RELATED_ORDER_NOT_FOUND);
    }
}