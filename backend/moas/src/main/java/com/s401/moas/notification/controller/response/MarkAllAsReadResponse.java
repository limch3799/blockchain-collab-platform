package com.s401.moas.notification.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Schema(description = "전체 알림 읽음 처리 응답")
@Getter
@Builder
public class MarkAllAsReadResponse {

    @Schema(description = "성공 메시지", example = "모든 알림이 읽음 처리되었습니다.")
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "응답 시간", example = "2025-01-15T10:30:00")
    private LocalDateTime timestamp;

    public static MarkAllAsReadResponse create() {
        return MarkAllAsReadResponse.builder()
                .message("모든 알림이 읽음 처리되었습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }
}