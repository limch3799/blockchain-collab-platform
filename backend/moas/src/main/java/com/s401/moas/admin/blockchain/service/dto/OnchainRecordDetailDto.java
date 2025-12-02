package com.s401.moas.admin.blockchain.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.member.domain.Member;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
public record OnchainRecordDetailDto(
        FailedJobInfo failedJobInfo,
        ContractInfo contractInfo,
        List<OnchainHistoryItem> onchainHistory
) {

    public static OnchainRecordDetailDto of(OnchainRecord targetRecord, Contract contract, Member leader, Member artist, List<OnchainRecord> history) {

        FailedJobInfo failedJob = FailedJobInfo.from(targetRecord);
        ContractInfo contractInfo = ContractInfo.from(contract, leader, artist);
        List<OnchainHistoryItem> historyItems = history.stream()
                .map(OnchainHistoryItem::from)
                .collect(Collectors.toList());

        return OnchainRecordDetailDto.builder()
                .failedJobInfo(failedJob)
                .contractInfo(contractInfo)
                .onchainHistory(historyItems)
                .build();
    }


    // === 내부 DTO 클래스들 ===

    @Builder
    public record FailedJobInfo(
            Long recordId,
            String jobType,
            String status,
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime timestamp,
            String transactionHash
    ) {
        public static FailedJobInfo from(OnchainRecord record) {
            return FailedJobInfo.builder()
                    .recordId(record.getId())
                    .jobType(record.getActionType().name())
                    .status(record.getStatus().name())
                    .timestamp(record.getUpdatedAt()) // 실패 시각은 updatedAt
                    .transactionHash(record.getTxHash())
                    .build();
        }
    }

    @Builder
    public record ContractInfo(
            Long contractId,
            String artistName,
            String leaderName,
            String currentContractStatus
    ) {
        public static ContractInfo from(Contract contract, Member leader, Member artist) {
            return ContractInfo.builder()
                    .contractId(contract.getId())
                    .artistName(artist.getNickname())
                    .leaderName(leader.getNickname())
                    .currentContractStatus(contract.getStatus().name())
                    .build();
        }
    }

    @Builder
    public record OnchainHistoryItem(
            Long recordId,
            String transactionHash,
            String jobType,
            String status,
            @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime timestamp
    ) {
        public static OnchainHistoryItem from(OnchainRecord record) {
            return OnchainHistoryItem.builder()
                    .recordId(record.getId())
                    .transactionHash(record.getTxHash())
                    .jobType(record.getActionType().name())
                    .status(record.getStatus().name())
                    .timestamp(record.getUpdatedAt())
                    .build();
        }
    }
}