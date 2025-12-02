package com.s401.moas.admin.member.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AdminMemberErrorCode implements BaseErrorCode {

    // 파라미터 검증
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "MEMBER_001", "요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요."),

    // 회원 관련
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_100", "존재하지 않는 회원입니다."),
    MEMBER_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "MEMBER_101", "이미 삭제된 회원입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}