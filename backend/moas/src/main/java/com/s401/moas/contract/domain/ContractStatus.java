package com.s401.moas.contract.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 계약의 생명주기를 나타내는 상태 Enum 입니다.
 */
@Getter
@RequiredArgsConstructor
public enum ContractStatus {
    PENDING("아티스트 응답 대기"),
    DECLINED("거절됨"),
    WITHDRAWN("철회됨"),
    ARTIST_SIGNED("아티스트 서명 완료"),
    PAYMENT_PENDING("결제 진행 중"),
    PAYMENT_COMPLETED("결제 완료"),
    COMPLETED("계약 이행 완료"),
    CANCELLATION_REQUESTED("취소 요청 중"),
    CANCELED("계약 파기됨");

    // 각 Enum 상수에 대한 설명 필드
    private final String description;
}