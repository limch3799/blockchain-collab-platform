package com.s401.moas.member.service.dto;

import com.s401.moas.global.util.PageInfo;
import com.s401.moas.payment.domain.Payment;
import com.s401.moas.payment.domain.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionHistoryDto {
    private SummaryDto summary;
    private List<TransactionItemDto> transactions;
    private PageInfo pagination;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryDto {
        private LeaderSummaryDto leaderSummary;
        private ArtistSummaryDto artistSummary;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaderSummaryDto {
        private long totalDepositAmount;
        private long totalAmount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistSummaryDto {
        private long totalAmount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItemDto {
        private Long transactionId;
        private String type;
        private long amount;
        private String description;
        private LocalDateTime createdAt;

        public TransactionItemDto(Long transactionId, PaymentType type, Long amount, String description, LocalDateTime createdAt) {
            this.transactionId = transactionId;
            this.type = type.name().toLowerCase();
            this.amount = amount;
            this.description = description;
            this.createdAt = createdAt;
        }
    }
}