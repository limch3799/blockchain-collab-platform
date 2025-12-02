package com.s401.moas.admin.payment.service;

import com.s401.moas.admin.payment.controller.request.AdminPaymentRequest;
import com.s401.moas.admin.payment.service.dto.AdminPaymentDto;
import com.s401.moas.payment.repository.projection.PaymentProjection;
import com.s401.moas.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;

    public Page<AdminPaymentDto> getPaymentList(AdminPaymentRequest request, Pageable pageable) {

        // 기간 변환: LocalDate -> LocalDateTime
        LocalDateTime startDateTime = request.getStartDate() != null ?
                request.getStartDate().atStartOfDay() : null;

        LocalDateTime endDateTime = request.getEndDate() != null ?
                request.getEndDate().plusDays(1).atStartOfDay().minusNanos(1) : null;

        // 1. Repository 호출 (Projection DTO 반환)
        Page<PaymentProjection> projectionPage = paymentRepository.findFilteredPaymentsProjection(
                request.getTypes(),
                request.getStatuses(),
                startDateTime,
                endDateTime,
                request.getOrderId(),
                request.getContractId(),
                request.getMemberId(),
                pageable
        );

        // 2. Projection DTO를 Service DTO로 변환하여 반환
        return projectionPage.map(AdminPaymentDto::from);
    }
}