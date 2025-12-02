package com.s401.moas.member.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.global.util.PageInfo;
import com.s401.moas.member.service.dto.TransactionHistoryDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionHistoryResponse {
    private Summary summary;
    private List<TransactionItem> transactions;
    private PageInfo pagination;

    public static TransactionHistoryResponse from(TransactionHistoryDto dto) {
        Summary responseSummary = Summary.from(dto.getSummary());
        List<TransactionItem> responseTransactions = dto.getTransactions().stream()
                .map(TransactionItem::from)
                .collect(Collectors.toList());

        return TransactionHistoryResponse.builder()
                .summary(responseSummary)
                .transactions(responseTransactions)
                .pagination(dto.getPagination())
                .build();
    }

    @Getter
    @Builder
    public static class Summary {
        private LeaderSummary leaderSummary;
        private ArtistSummary artistSummary;

        public static Summary from(TransactionHistoryDto.SummaryDto dto) {
            return Summary.builder()
                    .leaderSummary(dto.getLeaderSummary() != null ? LeaderSummary.from(dto.getLeaderSummary()) : null)
                    .artistSummary(dto.getArtistSummary() != null ? ArtistSummary.from(dto.getArtistSummary()) : null)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class LeaderSummary {
        private long totalDepositAmount;
        private long totalAmount;

        public static LeaderSummary from(TransactionHistoryDto.LeaderSummaryDto dto) {
            return LeaderSummary.builder()
                    .totalDepositAmount(dto.getTotalDepositAmount())
                    .totalAmount(dto.getTotalAmount())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class ArtistSummary {
        private long totalAmount; // 명세서와 필드명 통일

        public static ArtistSummary from(TransactionHistoryDto.ArtistSummaryDto dto) {
            return ArtistSummary.builder()
                    .totalAmount(dto.getTotalAmount())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class TransactionItem {
        private Long transactionId;
        private String type;
        private long amount;
        private String description;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        public static TransactionItem from(TransactionHistoryDto.TransactionItemDto dto) {
            return TransactionItem.builder()
                    .transactionId(dto.getTransactionId())
                    .type(dto.getType())
                    .amount(dto.getAmount())
                    .description(dto.getDescription())
                    .createdAt(dto.getCreatedAt())
                    .build();
        }
    }
}