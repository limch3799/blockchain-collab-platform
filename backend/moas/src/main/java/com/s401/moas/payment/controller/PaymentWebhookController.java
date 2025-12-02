package com.s401.moas.payment.controller;

import com.s401.moas.payment.controller.request.TossWebhookPayload;
import com.s401.moas.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook") // 웹훅 전용 경로
@RequiredArgsConstructor
public class PaymentWebhookController { // 컨트롤러 분리 추천

    private final PaymentService paymentService;

    /**
     * 토스페이먼츠 결제 상태 변경 웹훅을 수신하는 엔드포인트입니다.
     */
    @PostMapping("/toss")
    public ResponseEntity<Void> handleTossWebhook(@RequestBody TossWebhookPayload payload) {
        log.info("토스페이먼츠 웹훅 수신: {}", payload);

        // 서비스 계층에 처리를 위임
        paymentService.processWebhook(payload);

        // 토스페이먼츠 서버는 이 응답을 보고 웹훅이 성공적으로 전달되었다고 인지합니다.
        return ResponseEntity.ok().build();
    }
}