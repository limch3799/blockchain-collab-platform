package com.s401.moas.admin.inquiry.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum InquiryErrorCode implements BaseErrorCode {

    // 404 NOT FOUND
    INQUIRY_NOT_FOUND(HttpStatus.NOT_FOUND, "INQUIRY_001", "문의를 찾을 수 없습니다."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "INQUIRY_002", "회원을 찾을 수 없습니다."),
    ADMIN_NOT_FOUND(HttpStatus.NOT_FOUND, "INQUIRY_003", "관리자를 찾을 수 없습니다."),

    // 403 FORBIDDEN
    INQUIRY_ACCESS_DENIED(HttpStatus.FORBIDDEN, "INQUIRY_101", "문의 접근 권한이 없습니다."),

    // 400 BAD REQUEST
    INQUIRY_ALREADY_CLOSED(HttpStatus.BAD_REQUEST, "INQUIRY_201", "이미 종료된 문의입니다."),

    // 500 INTERNAL SERVER ERROR
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "INQUIRY_901", "파일 업로드에 실패했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}