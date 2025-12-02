package com.s401.moas.blockchain.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BlockchainErrorCode implements BaseErrorCode {
    // === 서버 오류 (5xx) ===
    // 블록체인 모듈의 오류는 대부분 외부 시스템(블록체인 노드)과의 통신 문제이거나
    // 데이터 불일치로 인한 서버 측 로직 오류이므로, 5xx 에러로 정의합니다.
    ONCHAIN_RECORD_NOT_FOUND("BC_C001", "존재하지 않는 온체인 기록입니다.", HttpStatus.NOT_FOUND),
    TRANSACTION_FAILED("BC_S001", "블록체인 트랜잭션 처리 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    EVENT_NOT_FOUND("BC_S002", "트랜잭션은 성공했으나, 예상된 온체인 이벤트를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    PENDING_RECORD_NOT_FOUND("BC_S003", "온체인 이벤트를 처리할 DB 기록을 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    RELATED_CONTRACT_NOT_FOUND("BC_S004", "온체인 이벤트에 해당하는 계약 정보가 DB에 존재하지 않습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    RPC_CONNECTION_ERROR("BC_S005", "블록체인 노드와의 통신에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_RETRY_UNFAILED_JOB("BC_C002", "실패하지 않은 작업은 재시도할 수 없습니다.", HttpStatus.CONFLICT),
    ALREADY_SUCCEEDED_JOB_EXISTS("BC_C003", "이미 성공한 동일한 작업이 존재하여 재시도할 수 없습니다.", HttpStatus.CONFLICT);

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