package com.s401.moas.admin.project.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AdminProjectErrorCode implements BaseErrorCode {

    // 404 NOT FOUND
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "ADMIN_PROJECT_001", "프로젝트를 찾을 수 없습니다."),

    // 400 BAD REQUEST
    PROJECT_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "ADMIN_PROJECT_201", "이미 삭제된 프로젝트입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}