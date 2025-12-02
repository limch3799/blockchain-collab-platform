package com.s401.moas.payment.controller.request; // 또는 payment.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@ToString
public class TossWebhookPayload {

    private String eventType;
    private LocalDateTime createdAt;
    private Data data;

    @Getter
    @NoArgsConstructor
    @ToString
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        private String paymentKey;
        private String orderId;
        private String status;

        private Card card;
        private VirtualAccount virtualAccount;

        /**
         * 어떤 결제 수단이든 상관없이 실제 결제 금액을 반환하는 편의 메서드입니다.
         * @return 결제 금액
         */
        public Long getAmount() {
            if (card != null) {
                return card.getAmount();
            }
            if (virtualAccount != null) {
                return virtualAccount.getAmount();
            }
            // 지원하지 않는 결제 수단이거나 amount 정보가 없는 경우
            return null;
        }

        // --- 중첩 클래스 정의 ---
        @Getter
        @NoArgsConstructor
        @ToString
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Card {
            private Long amount;
        }

        @Getter
        @NoArgsConstructor
        @ToString
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class VirtualAccount {
            @JsonProperty("totalAmount")
            private Long amount;
        }
    }
}