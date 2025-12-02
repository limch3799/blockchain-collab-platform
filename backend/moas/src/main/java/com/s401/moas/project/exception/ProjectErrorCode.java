package com.s401.moas.project.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ProjectErrorCode implements BaseErrorCode {

    // === 클라이언트 오류 (4xx) ===
    
    // 404 NOT_FOUND: 리소스를 찾을 수 없음
    PROJECT_NOT_FOUND(
            "PROJECT_C001", "프로젝트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND
    ),
    PROJECT_POSITION_NOT_FOUND(
            "PROJECT_C002", "프로젝트 포지션을 찾을 수 없습니다.", HttpStatus.NOT_FOUND
    ),
    PROJECT_BOOKMARK_NOT_FOUND(
            "PROJECT_C010", "북마크를 찾을 수 없습니다.", HttpStatus.NOT_FOUND
    ),
    
    // 403 FORBIDDEN: 권한 없음
    PROJECT_ACCESS_DENIED(
            "PROJECT_C003", "프로젝트 소유자만 가능한 작업입니다.", HttpStatus.FORBIDDEN
    ),
    
    // 400 BAD_REQUEST: 잘못된 요청
    PROJECT_POSITION_MISMATCH(
            "PROJECT_C004", "해당 프로젝트의 포지션이 아닙니다.", HttpStatus.BAD_REQUEST
    ),
    CANNOT_DELETE_POSITION_WITH_APPLICATIONS(
            "PROJECT_C005", "해당 포지션에 지원자가 있어 삭제할 수 없습니다.", HttpStatus.BAD_REQUEST
    ),
    INVALID_DATE_RANGE(
            "PROJECT_C006", "날짜 관계가 올바르지 않습니다. (applyDeadline <= startAt <= endAt)", HttpStatus.BAD_REQUEST
    ),
    DUPLICATE_POSITION_IDS(
            "PROJECT_C007", "중복된 포지션 ID가 있습니다.", HttpStatus.CONFLICT
    ),
    
    // 409 CONFLICT: 상태 충돌
    PROJECT_ALREADY_CLOSED(
            "PROJECT_C008", "마감 또는 종료된 프로젝트는 수정할 수 없습니다.", HttpStatus.CONFLICT
    ),
    PROJECT_BOOKMARK_ALREADY_EXISTS(
            "PROJECT_C009", "이미 북마크한 프로젝트입니다.", HttpStatus.CONFLICT
    ),
    PROJECT_POSITION_ALREADY_CLOSED(
            "PROJECT_C011", "이미 마감된 포지션입니다.", HttpStatus.CONFLICT
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

