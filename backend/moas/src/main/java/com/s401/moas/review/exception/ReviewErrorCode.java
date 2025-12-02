package com.s401.moas.review.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ReviewErrorCode implements BaseErrorCode {
    
    REVIEW_ALREADY_EXISTS(
            "REVIEW_C001",
            "이미 해당 계약에 대해 리뷰를 작성했습니다.",
            HttpStatus.CONFLICT
    ),
    REVIEWER_NOT_PARTICIPANT(
            "REVIEW_C002",
            "해당 계약에 대한 리뷰를 작성할 권한이 없습니다.",
            HttpStatus.FORBIDDEN
    ),
    REVIEWEE_NOT_PARTICIPANT(
            "REVIEW_C003",
            "리뷰 대상 회원이 해당 계약의 참여자가 아닙니다.",
            HttpStatus.BAD_REQUEST
    ),
    REVIEW_SELF_NOT_ALLOWED(
            "REVIEW_C004",
            "본인에 대한 리뷰는 작성할 수 없습니다.",
            HttpStatus.BAD_REQUEST
    ),
    REVIEW_PAIR_MISMATCH(
            "REVIEW_C005",
            "리뷰 작성자와 대상자가 계약 정보와 일치하지 않습니다.",
            HttpStatus.BAD_REQUEST
    ),
    REVIEW_INVALID_CONTRACT_STATUS(
            "REVIEW_C006",
            "계약 상태(%s)에서는 리뷰를 작성할 수 없습니다.",
            HttpStatus.CONFLICT
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

