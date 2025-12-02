package com.s401.moas.global.exception.base;

import org.springframework.http.HttpStatus;

/**
 * 모든 에러 코드가 구현해야 하는 기본 인터페이스
 * 각 도메인의 ErrorCode enum들이 이 인터페이스를 구현함
 */
public interface BaseErrorCode {

    /**
     * 에러 코드 반환 (예: "NOT_FOUND", "BAD_REQUEST", "PF_S001")
     * @return 고유한 에러 코드
     */
    String getCode();

    /**
     * 사용자에게 표시될 에러 메시지 반환
     * @return 에러 메시지
     */
    String getMessage();

    /**
     * HTTP 상태 코드 반환
     * @return HTTP 상태 코드 (4xx, 5xx 등)
     */
    HttpStatus getHttpStatus();
}

