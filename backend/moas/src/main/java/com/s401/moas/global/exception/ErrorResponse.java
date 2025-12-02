package com.s401.moas.global.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 통일된 에러 응답 클래스
 * 4xx 클라이언트 오류와 5xx 서버 오류 모두에 사용
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String errorCode;
    private String message;
    private Long timestamp;

    /**
     * 기본 에러 응답 생성
     */
    public static ErrorResponse of(String errorCode, String message) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * HttpStatus를 사용한 에러 응답 생성 (4xx 클라이언트 오류용)
     */
    public static ErrorResponse of(HttpStatus status, String message) {
        return ErrorResponse.builder()
                .errorCode(status.name())
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
