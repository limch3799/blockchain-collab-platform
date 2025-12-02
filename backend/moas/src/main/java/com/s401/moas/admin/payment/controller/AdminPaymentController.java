package com.s401.moas.admin.payment.controller;

import com.s401.moas.admin.payment.controller.request.AdminPaymentRequest;
import com.s401.moas.admin.payment.controller.response.AdminPaymentResponse;
import com.s401.moas.admin.payment.service.AdminPaymentService;
import com.s401.moas.admin.payment.service.dto.AdminPaymentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Profile("admin")
@RestController
@RequestMapping("/admin/api/payments")
@RequiredArgsConstructor
public class AdminPaymentController implements AdminPaymentControllerSpec {

    private final AdminPaymentService adminPaymentService;

    /**
     * 관리자용 Payment 거래 원장 목록 조회 및 필터링 엔드포인트
     */
    @GetMapping
    public ResponseEntity<Page<AdminPaymentResponse>> getPaymentList(
            @ModelAttribute AdminPaymentRequest request,
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        // 1. Service 호출 (Service DTO Page 반환)
        Page<AdminPaymentDto> dtoPage = adminPaymentService.getPaymentList(request, pageable);

        // 2. Service DTO를 Response DTO로 최종 변환 (Controller 책임)
        Page<AdminPaymentResponse> responsePage = dtoPage.map(AdminPaymentResponse::from);

        return ResponseEntity.ok(responsePage);
    }
}