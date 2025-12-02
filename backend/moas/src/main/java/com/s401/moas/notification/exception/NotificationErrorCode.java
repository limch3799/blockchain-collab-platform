package com.s401.moas.notification.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum NotificationErrorCode implements BaseErrorCode {

    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    NOTIFICATION_NOT_FOUND(
            "NOT_FOUND",
            "요청한 리소스를 찾을 수 없습니다.",
            HttpStatus.NOT_FOUND
    ),

    // 403 FORBIDDEN: 권한 없음
    NOTIFICATION_ACCESS_DENIED(
            "NOTIFICATION_ACCESS_DENIED",
            "알림에 접근할 권한이 없습니다.",
            HttpStatus.FORBIDDEN
    );

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