package com.s401.moas.global.exception.base;

import org.springframework.http.HttpStatus;

/**
 * 모든 에러 예외의 기본 클래스
 * 각 도메인의 Exception들이 이 클래스를 상속함
 */
public abstract class BaseException extends RuntimeException {

    private final BaseErrorCode errorCode;
    private final Object[] args;  // 메시지 파라미터 (선택적)

    /**
     * 기본 생성자
     * @param errorCode 에러 코드 enum
     */
    protected BaseException(BaseErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    /**
     * 원인 예외와 함께 생성
     * @param errorCode 에러 코드 enum
     * @param cause 원인 예외
     */
    protected BaseException(BaseErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    /**
     * 메시지 파라미터와 함께 생성
     * @param errorCode 에러 코드 enum
     * @param args 메시지 파라미터들
     */
    protected BaseException(BaseErrorCode errorCode, Object... args) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.args = args;
    }

    /**
     * 원인 예외와 메시지 파라미터 모두 포함
     * @param errorCode 에러 코드 enum
     * @param cause 원인 예외
     * @param args 메시지 파라미터들
     */
    protected BaseException(BaseErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.args = args;
    }

    /**
     * 에러 코드 반환
     * @return BaseErrorCode 구현체
     */
    public BaseErrorCode getErrorCode() {
        return errorCode;
    }

    /**
     * HTTP 상태 코드 반환
     * @return HTTP 상태 코드
     */
    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }

    /**
     * 메시지 파라미터들 반환
     * @return 파라미터 배열
     */
    public Object[] getArgs() {
        return args;
    }

    /**
     * 에러 코드 문자열 반환 (편의 메소드)
     * @return 에러 코드 문자열
     */
    public String getCode() {
        return errorCode.getCode();
    }
}

