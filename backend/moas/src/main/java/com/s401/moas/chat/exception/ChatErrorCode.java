package com.s401.moas.chat.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ChatErrorCode implements BaseErrorCode {

    // === 클라이언트 오류 (4xx) ===

    // 400 BAD_REQUEST: 요청 파라미터 검증 실패
    INVALID_INPUT(
            "INVALID_INPUT",
            "잘못된 요청입니다.",
            HttpStatus.BAD_REQUEST
    ),

    CANNOT_CHAT_WITH_SELF(
            "CANNOT_CHAT_WITH_SELF",
            "자기 자신과 채팅할 수 없습니다.",
            HttpStatus.BAD_REQUEST
    ),

    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    PROJECT_NOT_FOUND(
            "NOT_FOUND",
            "요청한 리소스를 찾을 수 없습니다.",
            HttpStatus.NOT_FOUND
    ),

    MEMBER_NOT_FOUND(
            "NOT_FOUND",
            "요청한 리소스를 찾을 수 없습니다.",
            HttpStatus.NOT_FOUND
    ),

    CHATROOM_NOT_FOUND(
            "NOT_FOUND",
            "요청한 리소스를 찾을 수 없습니다.",
            HttpStatus.NOT_FOUND
    ),

    // 409 CONFLICT: 채팅 거부
    CHAT_BLOCKED(
            "CHAT_BLOCKED",
            "채팅방을 생성할 수 없습니다.",
            HttpStatus.CONFLICT
    ),
    ALREADY_LEFT_CHATROOM(
            "ALREADY_LEFT_CHATROOM",
            "이미 퇴장한 채팅방입니다.",
            HttpStatus.CONFLICT
    ),
    ALREADY_BLOCKED(
            "ALREADY_BLOCKED",
            "이미 차단한 사용자입니다.",
            HttpStatus.CONFLICT
    ),

    NOT_BLOCKED(
            "NOT_BLOCKED",
            "차단되지 않은 사용자입니다.",
            HttpStatus.CONFLICT
    ),

    INVALID_FILE_SIZE(
            "PAYLOAD_TOO_LARGE",
            "파일 용량이 너무 큽니다.",
            HttpStatus.PAYLOAD_TOO_LARGE
    ),

    UNSUPPORTED_FILE_TYPE(
            "UNSUPPORTED_MEDIA_TYPE",
            "지원하지 않는 파일 형식입니다.",
            HttpStatus.UNSUPPORTED_MEDIA_TYPE
    ),

    MESSAGE_TOO_LONG(
            "BAD_REQUEST",
            "메시지는 최대 500자까지 입력 가능합니다.",
            HttpStatus.BAD_REQUEST
    ),

    EMPTY_MESSAGE_AND_FILES(
            "BAD_REQUEST",
            "메시지 내용 또는 파일 중 하나는 필수입니다.",
            HttpStatus.BAD_REQUEST
    ),
    TOO_MANY_FILES(
            "BAD_REQUEST",
            "파일은 최대 10개까지 첨부 가능합니다.",
            HttpStatus.BAD_REQUEST
    ),

    FILE_SIZE_EXCEEDED(
            "PAYLOAD_TOO_LARGE",
            "파일 용량이 너무 큽니다.",
            HttpStatus.PAYLOAD_TOO_LARGE
    ),

    FILE_UPLOAD_FAILED(
            "INTERNAL_SERVER_ERROR",
            "파일 업로드에 실패했습니다.",
            HttpStatus.INTERNAL_SERVER_ERROR
    ),

    // 403 FORBIDDEN: 권한 없음
    CHAT_ACCESS_DENIED(
            "CHAT_ACCESS_DENIED",
            "채팅방에 접근할 권한이 없습니다.",
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