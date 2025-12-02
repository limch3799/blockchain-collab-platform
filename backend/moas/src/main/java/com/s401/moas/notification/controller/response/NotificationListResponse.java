package com.s401.moas.notification.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.notification.service.dto.NotificationListDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "알림 목록 조회 응답")
@Getter
@Builder
public class NotificationListResponse {

    @Schema(description = "알림 목록")
    private List<NotificationItemResponse> notifications;

    @Schema(description = "응답 시간", example = "2025-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    public static NotificationListResponse from(NotificationListDto dto) {
        List<NotificationItemResponse> notifications = dto.getNotifications().stream()
                .map(NotificationItemResponse::from)
                .toList();

        return NotificationListResponse.builder()
                .notifications(notifications)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Schema(description = "알림 항목")
    @Getter
    @Builder
    public static class NotificationItemResponse {

        @Schema(description = "알림 ID", example = "1")
        private Long notificationId;

        @Schema(description = "알림 타입", example = "APPLICATION_RECEIVED")
        private String alarmType;

        @Schema(description = "관련 ID", example = "123")
        private Long relatedId;

        @Schema(description = "읽음 여부", example = "false")
        private Boolean isRead;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "생성일시", example = "2025-01-15T10:30:00")
        private LocalDateTime createdAt;

        public static NotificationItemResponse from(NotificationListDto.NotificationItemDto dto) {
            return NotificationItemResponse.builder()
                    .notificationId(dto.getNotificationId())
                    .alarmType(dto.getAlarmType())
                    .relatedId(dto.getRelatedId())
                    .isRead(dto.getIsRead())
                    .createdAt(dto.getCreatedAt())
                    .build();
        }
    }
}