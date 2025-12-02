package com.s401.moas.admin.contract.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.admin.contract.service.dto.ContractLogDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Schema(description = "계약 이력 응답")
public class ContractLogResponse {

    @Schema(description = "이력 목록")
    private List<LogItem> logs;

    @Getter
    @AllArgsConstructor
    @Schema(description = "이력 항목")
    public static class LogItem {
        @Schema(description = "로그 ID", example = "1")
        private Long logId;

        @Schema(description = "액션 타입", example = "CONTRACT_CREATED")
        private String actionType;

        @Schema(description = "수행자 회원 ID", example = "1234")
        private Integer actorMemberId;

        @Schema(description = "수행자 닉네임", example = "홍길동")
        private String actorNickname;

        @Schema(description = "상세 정보 (JSON)", example = "{\"reason\":\"test\"}")
        private String details;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "생성일시")
        private LocalDateTime createdAt;
    }

    public static ContractLogResponse from(List<ContractLogDto> dtos) {
        List<LogItem> items = dtos.stream()
                .map(dto -> new LogItem(
                        dto.getLogId(),
                        dto.getActionType(),
                        dto.getActorMemberId(),
                        dto.getActorNickname(),
                        dto.getDetails(),
                        dto.getCreatedAt()
                ))
                .toList();

        return new ContractLogResponse(items);
    }
}