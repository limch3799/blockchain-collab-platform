package com.s401.moas.notification.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class NotificationListDto {

    private List<NotificationItemDto> notifications;

    @Getter
    @Builder
    public static class NotificationItemDto {
        private Long notificationId;
        private String alarmType;
        private Long relatedId;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }
}