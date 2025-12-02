package com.s401.moas.chat.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.chat.service.dto.SendMessageDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "채팅 메시지 전송 응답")
public class SendMessageResponse {

    @Schema(description = "응답 메시지", example = "메시지 전송을 성공했습니다.")
    private final String message;

    @Schema(description = "메시지 데이터")
    private final MessageData data;

    public static SendMessageResponse from(SendMessageDto dto, String message) {
        return SendMessageResponse.builder()
                .message(message)
                .data(MessageData.builder()
                        .messageId(dto.getMessageId())
                        .fileCount(dto.getFileCount())
                        .createdAt(dto.getCreatedAt())
                        .build())
                .build();
    }

    @Getter
    @Builder
    @Schema(description = "메시지 정보")
    public static class MessageData {

        @Schema(description = "메시지 ID", example = "1005")
        private final Long messageId;

        @Schema(description = "첨부된 파일 개수", example = "2")
        private final Integer fileCount;

        @Schema(description = "메시지 전송 시간", example = "2023-11-15T16:45:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;
    }
}