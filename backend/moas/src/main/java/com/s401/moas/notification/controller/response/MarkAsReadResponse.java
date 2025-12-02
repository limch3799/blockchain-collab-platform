package com.s401.moas.notification.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Schema(description = "알림 읽음 처리 응답")
@Getter
@Builder
public class MarkAsReadResponse {

    @Schema(description = "읽음 처리된 알림 ID", example = "1")
    private Long notificationId;

    @Schema(description = "읽음 여부", example = "true")
    private Boolean isRead;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "응답 시간", example = "2025-01-15T10:30:00")
    private LocalDateTime timestamp;

    public static MarkAsReadResponse from(Long notificationId) {
        return MarkAsReadResponse.builder()
                .notificationId(notificationId)
                .isRead(true)
                .timestamp(LocalDateTime.now())
                .build();
    }
}