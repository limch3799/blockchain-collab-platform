package com.s401.moas.payment.domain;

public enum OrderStatus {
    PENDING, // 결제 대기 중
    PAID,    // 결제 완료
    FAILED,  // 결제 실패
    CANCELED, // 결제 취소 (환불)
    PARTIAL_CANCELED // 부분 취소 (환불)
}