package com.s401.moas.contract.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ContractErrorCode implements BaseErrorCode {
    CONTRACT_NOT_FOUND("CON_C001", "계약서를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    CONTRACT_ACCESS_DENIED("CON_C002", "계약서를 조회할 권한이 없습니다.", HttpStatus.FORBIDDEN),
    CANNOT_PROCESS_NOT_PENDING("CON_C003", "대기중인 계약서만 처리할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_REOFFER_NOT_DECLINED("CON_C004", "거절된 상태의 계약서만 수정하여 재제시할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_WITHDRAW_INVALID_STATUS("CON_C005", "대기중이거나 거절된 상태의 계약만 철회할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_FINALIZE_INVALID_STATUS("CON_C006", "아티스트가 수락한 상태의 계약만 체결할 수 있습니다.", HttpStatus.CONFLICT),
    SIGNATURE_INVALID("CON_C007", "유효하지 않은 서명입니다.", HttpStatus.BAD_REQUEST),
    CANNOT_CONFIRM_INVALID_STATUS("CON_C008", "결제가 완료된 상태의 계약만 구매 확정할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_COMPLETE_INVALID_STATUS("CON_C009", "결제가 완료된 상태의 계약만 최종 완료 처리할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_CANCEL_INVALID_STATUS("CON_C010", "결제가 완료되었거나 취소 요청 중인 계약만 취소를 요청할 수 있습니다.", HttpStatus.CONFLICT),
    CANNOT_APPROVE_CANCELLATION_INVALID_STATUS("CON_C011", "취소 요청 상태의 계약만 승인할 수 있습니다.", HttpStatus.CONFLICT),
    INVALID_STATUS_PARAMETER("CON_C012", "유효하지 않은 조회 상태 파라미터입니다.", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_TRANSITION("CON_S001", "잘못된 계약 상태 변경 시도입니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    ACTION_LOG_NOT_FOUND("CON_S002", "필수 활동 기록(ActionLog)을 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

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