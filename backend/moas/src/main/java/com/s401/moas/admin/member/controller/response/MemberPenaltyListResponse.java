package com.s401.moas.admin.member.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.member.service.dto.MemberPenaltyListDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MemberPenaltyListResponse {
    private final List<PenaltyItem> penalties;

    public static MemberPenaltyListResponse from(MemberPenaltyListDto dto) {
        return MemberPenaltyListResponse.builder()
                .penalties(dto.getPenalties().stream()
                        .map(PenaltyItem::from)
                        .collect(Collectors.toList()))
                .build();
    }

    @Getter
    @Builder
    public static class PenaltyItem {
        private final Long id;
        private final Integer memberId;
        private final Long contractId;
        private final Integer changedBy;
        private final Integer penaltyScore;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime changedAt;

        public static PenaltyItem from(MemberPenaltyListDto.PenaltyItemDto dto) {
            return PenaltyItem.builder()
                    .id(dto.getId())
                    .memberId(dto.getMemberId())
                    .contractId(dto.getContractId())
                    .changedBy(dto.getChangedBy())
                    .penaltyScore(dto.getPenaltyScore())
                    .createdAt(dto.getCreatedAt())
                    .changedAt(dto.getChangedAt())
                    .build();
        }
    }
}