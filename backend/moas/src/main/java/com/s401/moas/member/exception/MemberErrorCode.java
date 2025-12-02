package com.s401.moas.member.exception;

import org.springframework.http.HttpStatus;

import com.s401.moas.global.exception.base.BaseErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberErrorCode implements BaseErrorCode {

    // === 클라이언트 오류 (4xx) ===
    // 400 BAD_REQUEST: 경로 파라미터 형식 오류/범위 초과
    INVALID_MEMBER_ID_FORMAT(
            "BAD_REQUEST", "요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.", HttpStatus.BAD_REQUEST),

    // 400 BAD_REQUEST: 닉네임 길이 오류
    NICKNAME_TOO_LONG(
            "BAD_REQUEST", "닉네임은 2~50자여야 합니다.", HttpStatus.BAD_REQUEST),

    // 400 BAD_REQUEST: 휴대폰 번호 형식 오류
    INVALID_PHONE_NUMBER_FORMAT(
            "BAD_REQUEST", "휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)", HttpStatus.BAD_REQUEST),

    // 404 NOT_FOUND: 미존재/비공개/탈퇴/형식 은닉 처리
    MEMBER_NOT_FOUND(
            "NOT_FOUND", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // 409 CONFLICT: 닉네임 중복
    NICKNAME_DUPLICATE(
            "CONFLICT", "이미 사용 중인 닉네임입니다.", HttpStatus.CONFLICT),

    // 409 CONFLICT: 탈퇴 제한 상태 (계약 진행중, 정산 미종료 등)
    MEMBER_DELETE_CONFLICT(
            "CONFLICT", "현재 상태에서는 요청을 처리할 수 없습니다.", HttpStatus.CONFLICT),

    // 403 FORBIDDEN: 권한 없음
    INVALID_MEMBER_ROLE(
            "FORBIDDEN", "권한이 없습니다.", HttpStatus.FORBIDDEN),

    // 409 CONFLICT: 역할 변경 불가 (PENDING 상태가 아닌 경우)
    CANNOT_UPDATE_ROLE_NOT_PENDING(
            "CONFLICT", "PENDING 상태에서만 역할을 변경할 수 있습니다.", HttpStatus.CONFLICT),

    // 400 BAD_REQUEST: 잘못된 리뷰 타입
    INVALID_REVIEW_TYPE(
            "BAD_REQUEST", "type은 'received' 또는 'sent'만 가능합니다.", HttpStatus.BAD_REQUEST),

    // 400 BAD_REQUEST: 잘못된 은행 코드
    INVALID_BANK_CODE(
            "BAD_REQUEST", "존재하지 않는 은행 코드입니다.", HttpStatus.BAD_REQUEST),

    // 404 NOT_FOUND: 계좌를 찾을 수 없음
    BANK_ACCOUNT_NOT_FOUND(
            "NOT_FOUND", "계좌를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // 409 CONFLICT: 이미 활성 계좌가 존재함
    BANK_ACCOUNT_ALREADY_EXISTS(
            "CONFLICT", "이미 등록된 계좌가 있습니다. 계좌를 삭제한 후 다시 등록해주세요.", HttpStatus.CONFLICT),

    // 400 BAD_REQUEST: 검증할 수 없는 계좌 상태
    INVALID_BANK_ACCOUNT_STATUS(
            "BAD_REQUEST", "PENDING 상태의 계좌만 검증할 수 있습니다.", HttpStatus.BAD_REQUEST);

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
