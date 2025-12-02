package com.s401.moas.admin.inquiry.exception;

import com.s401.moas.global.exception.base.BaseException;

public class InquiryException extends BaseException {

    public InquiryException(InquiryErrorCode errorCode) {
        super(errorCode);
    }

    // 문의를 찾을 수 없음
    public static InquiryException inquiryNotFound() {
        return new InquiryException(InquiryErrorCode.INQUIRY_NOT_FOUND);
    }

    // 문의 접근 권한 없음 (본인 문의 아님)
    public static InquiryException inquiryAccessDenied() {
        return new InquiryException(InquiryErrorCode.INQUIRY_ACCESS_DENIED);
    }

    // 이미 종료된 문의
    public static InquiryException inquiryAlreadyClosed() {
        return new InquiryException(InquiryErrorCode.INQUIRY_ALREADY_CLOSED);
    }

    // 파일 업로드 실패
    public static InquiryException fileUploadFailed(Throwable cause) {
        InquiryException exception = new InquiryException(InquiryErrorCode.FILE_UPLOAD_FAILED);
        exception.initCause(cause);
        return exception;
    }

    // 회원을 찾을 수 없음
    public static InquiryException memberNotFound() {
        return new InquiryException(InquiryErrorCode.MEMBER_NOT_FOUND);
    }

    // 관리자를 찾을 수 없음
    public static InquiryException adminNotFound() {
        return new InquiryException(InquiryErrorCode.ADMIN_NOT_FOUND);
    }
}