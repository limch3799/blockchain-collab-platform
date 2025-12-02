package com.s401.moas.admin.payment.controller.request;

import com.s401.moas.payment.domain.PaymentStatus;
import com.s401.moas.payment.domain.PaymentType;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Data
public class AdminPaymentRequest {
    private List<PaymentType> types; // 거래 유형 필터링
    private List<PaymentStatus> statuses; // 거래 상태 필터링

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate; // 기간 시작일

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate; // 기간 종료일

    private String orderId; // 주문 ID 검색
    private Long contractId; // 계약 ID 검색
    private Integer memberId; // 회원 ID 검색 (주체 또는 결제자)
}