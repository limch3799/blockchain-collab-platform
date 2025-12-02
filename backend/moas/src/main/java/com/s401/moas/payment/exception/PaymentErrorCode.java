package com.s401.moas.payment.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PaymentErrorCode implements BaseErrorCode {
    // === 클라이언트 오류 (4xx) ===
    ORDER_NOT_FOUND("PAY_C001", "존재하지 않는 주문입니다.", HttpStatus.NOT_FOUND),
    AMOUNT_MISMATCH("PAY_C002", "주문 금액이 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
    ALREADY_PROCESSED_ORDER("PAY_C003", "이미 처리된 주문입니다.", HttpStatus.CONFLICT),

    INVALID_PAYMENT_TYPE_FOR_STATUS_CHANGE("PAY_C004", "해당 거래 유형의 상태를 변경할 수 없습니다.", HttpStatus.BAD_REQUEST),
    CANNOT_COMPLETE_ALREADY_PROCESSED_PAYMENT("PAY_C005", "이미 처리되었거나 실패한 거래 건입니다.", HttpStatus.CONFLICT),
    CANNOT_CANCEL_INVALID_ORDER_STATUS("PAY_C006", "결제가 완료된 주문만 취소할 수 있습니다.", HttpStatus.CONFLICT),
    // === 서버 오류 (5xx) ===
    RELATED_CONTRACT_NOT_FOUND("PAY_S001", "주문에 연결된 계약 정보를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    TOSS_API_ERROR("PAY_S002", "결제 시스템 연동 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_APPROVAL_FAILED("PAY_S003", "결제 승인에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    RELATED_APPLICATION_NOT_FOUND("PAY_S004", "계약에 연결된 원본 지원서를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    RELATED_ORDER_NOT_FOUND("PAY_S005", "계약에 연결된 '결제 완료' 상태의 주문 정보를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

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