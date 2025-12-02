package com.s401.moas.payment.controller;

import com.s401.moas.payment.controller.request.PaymentApproveRequest;
import com.s401.moas.payment.controller.response.PaymentApproveResponse;
import com.s401.moas.payment.service.PaymentService;
import com.s401.moas.payment.service.dto.PaymentApproveResultDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 프론트엔드에서 결제 성공 후, 최종 승인을 요청하는 엔드포인트입니다.
     */
    @PostMapping("/approve")
    public ResponseEntity<PaymentApproveResponse> approvePayment(
            @Valid @RequestBody PaymentApproveRequest request) {

        PaymentApproveResultDto resultDto = paymentService.approvePayment(
                request.getPaymentKey(),
                request.getOrderId(),
                request.getAmount()
        );

        PaymentApproveResponse response = PaymentApproveResponse.builder()
                .orderId(resultDto.getOrderId())
                .status(resultDto.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }
}