package com.s401.moas.admin.inquiry.domain;

/**
 * 문의 상태
 */
public enum InquiryStatus {
    PENDING,    // 답변 대기
    ANSWERED,   // 답변 완료
    CLOSED      // 종료됨
}
