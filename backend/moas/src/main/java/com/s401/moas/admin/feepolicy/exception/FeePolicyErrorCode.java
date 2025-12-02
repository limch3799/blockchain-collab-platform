package com.s401.moas.admin.feepolicy.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum FeePolicyErrorCode implements BaseErrorCode {

    FEE_POLICY_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "FEE_POLICY_NOT_FOUND",
            "수수료 정책을 찾을 수 없습니다."
    ),
    INVALID_FEE_RATE(
            HttpStatus.BAD_REQUEST,
            "INVALID_FEE_RATE",
            "수수료율은 0~100% 사이여야 합니다."
    ),
    INVALID_START_DATE(
            HttpStatus.BAD_REQUEST,
            "INVALID_START_DATE",
            "적용 시작일은 미래 날짜여야 합니다."
    ),
    PAST_POLICY_IMMUTABLE(
            HttpStatus.BAD_REQUEST,
            "PAST_POLICY_IMMUTABLE",
            "과거 또는 현재 정책은 변경할 수 없습니다."
    );

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}