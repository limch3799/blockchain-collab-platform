package com.s401.moas.application.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ApplicationErrorCode implements BaseErrorCode {

    // === 클라이언트 오류 (4xx) ===
    LEADER_CANNOT_APPLY(
            "APP_C001", "프로젝트 리더는 프로젝트에 지원할 수 없습니다.", HttpStatus.FORBIDDEN
    ),
    ALREADY_APPLIED(
            "APP_C002", "이미 해당 포지션에 지원했습니다.", HttpStatus.CONFLICT
    ),
    APPLICATION_NOT_FOUND(
            "APP_C003", "존재하지 않는 지원서입니다.", HttpStatus.NOT_FOUND
    ),
    APPLICATION_ACCESS_DENIED(
            "APP_C004", "해당 지원서에 대한 권한이 없습니다.", HttpStatus.FORBIDDEN
    ),
    CANNOT_CANCEL_NOT_PENDING(
            "APP_C005", "대기중인 지원서만 취소할 수 있습니다.", HttpStatus.CONFLICT
    ),
    NOT_PROJECT_LEADER(
            "APP_C006", "프로젝트 리더만 가능한 작업입니다.", HttpStatus.FORBIDDEN
    ),
    CANNOT_PROCESS_NOT_PENDING(
            "APP_C007", "대기중인 지원서만 처리할 수 있습니다.", HttpStatus.CONFLICT
    ),
    CANNOT_COMPLETE_NOT_OFFERED(
            "APP_C008", "제안(OFFERED) 상태인 지원서만 완료 처리할 수 있습니다.", HttpStatus.CONFLICT
    ),
    CONTRACT_ID_REQUIRED(
            "APP_C009", "계약 제안 시 계약 ID는 필수입니다.", HttpStatus.BAD_REQUEST
    ),
    APPLICATION_CLOSED(
            "APP_C010", "이미 모집이 마감된 포지션입니다.", HttpStatus.CONFLICT
    ),
    INVALID_APPLICATION_STATUS(
            "APP_C011", "유효하지 않은 지원 상태 값입니다.", HttpStatus.BAD_REQUEST
    ),
    NOT_OWNER_APPLICATION(
            "APP_C012", "본인의 지원서만 확인할 수 있습니다.", HttpStatus.UNAUTHORIZED
    );

    // 포트폴리오/프로젝트 Not Found는 각 도메인의 예외를 사용하는 것이 더 적합할 수 있습니다.
    // 여기서는 Application 도메인 관점의 오류만 정의합니다.

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