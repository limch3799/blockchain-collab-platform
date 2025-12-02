package com.s401.moas.notification.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Schema(description = "알림 삭제 응답")
@Getter
@Builder
public class DeleteNotificationResponse {

    @Schema(description = "삭제된 알림 ID", example = "1")
    private Long notificationId;

    @Schema(description = "성공 메시지", example = "알림이 삭제되었습니다.")
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "응답 시간", example = "2025-01-15T10:30:00")
    private LocalDateTime timestamp;

    public static DeleteNotificationResponse from(Long notificationId) {
        return DeleteNotificationResponse.builder()
                .notificationId(notificationId)
                .message("알림이 삭제되었습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }
}