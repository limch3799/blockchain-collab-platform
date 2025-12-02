package com.s401.moas.contract.service.dto;

/**
 * '진행/완료'된 내 계약 목록을 조회할 때 사용하는 API 전용 상태 Enum입니다.
 * DB의 ContractStatus와 현재 시간을 조합하여 결정되는 가상적인 상태를 나타냅니다.
 */
public enum ContractViewStatus {
    /**
     * 진행 전 계약 (PAYMENT_COMPLETED 상태이면서, 현재 시간이 계약 시작 시간 이전)
     */
    BEFORE_START,

    /**
     * 진행 중 계약 (PAYMENT_COMPLETED 상태이면서, 현재 시간이 계약 시작 시간 이후)
     */
    IN_PROGRESS,

    /**
     * 완료된 계약 (COMPLETED 상태)
     */
    COMPLETED
}