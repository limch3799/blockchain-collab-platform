package com.s401.moas.admin.blockchain.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.blockchain.domain.OnchainRecord;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record FailedOnchainRecordDto(
        Long recordId,
        Long relatedContractId,
        String jobType,
        String status,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime failureTime
) {
    public static FailedOnchainRecordDto fromEntity(OnchainRecord record) {
        return FailedOnchainRecordDto.builder()
                .recordId(record.getId())
                .relatedContractId(record.getContractId())
                .jobType(record.getActionType().name())
                .status(record.getStatus().name())
                .failureTime(record.getUpdatedAt()) // 실패 시간은 updatedAt을 사용
                .build();
    }
}