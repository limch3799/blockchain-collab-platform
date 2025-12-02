package com.s401.moas.member.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Member 도메인 예외
 */
public class MemberException extends BaseException {

    public MemberException(MemberErrorCode errorCode) {
        super(errorCode);
    }

    public MemberException(MemberErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public MemberException(MemberErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public MemberException(MemberErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    /**
     * 경로 파라미터 형식 오류/범위 초과
     * DB 조회 전 검증 실패
     */
    public static MemberException invalidMemberIdFormat() {
        return new MemberException(MemberErrorCode.INVALID_MEMBER_ID_FORMAT);
    }

    /**
     * 회원 미존재/비공개/탈퇴/형식 은닉 처리
     * DB 조회 후 검증 실패
     */
    public static MemberException memberNotFound() {
        return new MemberException(MemberErrorCode.MEMBER_NOT_FOUND);
    }

    /**
     * 탈퇴 제한 상태 (계약 진행중, 정산 미종료, 채용 제안 받은 상태 등)
     * 409 CONFLICT
     */
    public static MemberException memberDeleteConflict() {
        return new MemberException(MemberErrorCode.MEMBER_DELETE_CONFLICT);
    }

    /**
     * 권한 없음
     * 403 FORBIDDEN
     */
    public static MemberException invalidMemberRole() {
        return new MemberException(MemberErrorCode.INVALID_MEMBER_ROLE);
    }

    /**
     * 닉네임 길이 초과 (50자 초과)
     * 400 BAD_REQUEST
     */
    public static MemberException nicknameTooLong() {
        return new MemberException(MemberErrorCode.NICKNAME_TOO_LONG);
    }

    /**
     * 휴대폰 번호 형식 오류
     * 400 BAD_REQUEST
     */
    public static MemberException invalidPhoneNumberFormat() {
        return new MemberException(MemberErrorCode.INVALID_PHONE_NUMBER_FORMAT);
    }

    /**
     * 닉네임 중복
     * 409 CONFLICT
     */
    public static MemberException nicknameDuplicate() {
        return new MemberException(MemberErrorCode.NICKNAME_DUPLICATE);
    }

    /**
     * 역할 변경 불가 (PENDING 상태가 아닌 경우)
     * 409 CONFLICT
     */
    public static MemberException cannotUpdateRoleNotPending() {
        return new MemberException(MemberErrorCode.CANNOT_UPDATE_ROLE_NOT_PENDING);
    }

    /**
     * 잘못된 리뷰 타입
     * 400 BAD_REQUEST
     */
    public static MemberException invalidReviewType() {
        return new MemberException(MemberErrorCode.INVALID_REVIEW_TYPE);
    }

    /**
     * 잘못된 은행 코드
     * 400 BAD_REQUEST
     */
    public static MemberException invalidBankCode() {
        return new MemberException(MemberErrorCode.INVALID_BANK_CODE);
    }

    /**
     * 계좌를 찾을 수 없음
     * 404 NOT_FOUND
     */
    public static MemberException bankAccountNotFound() {
        return new MemberException(MemberErrorCode.BANK_ACCOUNT_NOT_FOUND);
    }

    /**
     * 이미 활성 계좌가 존재함
     * 409 CONFLICT
     */
    public static MemberException bankAccountAlreadyExists() {
        return new MemberException(MemberErrorCode.BANK_ACCOUNT_ALREADY_EXISTS);
    }

    /**
     * 검증할 수 없는 계좌 상태
     * 400 BAD_REQUEST
     */
    public static MemberException invalidBankAccountStatus() {
        return new MemberException(MemberErrorCode.INVALID_BANK_ACCOUNT_STATUS);
    }
}
