package com.s401.moas.notification.controller;

import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.notification.controller.request.GetNotificationsRequest;
import com.s401.moas.notification.controller.response.*;
import com.s401.moas.notification.service.NotificationService;
import com.s401.moas.notification.service.dto.NotificationListDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController implements NotificationControllerSpec {

    private final NotificationService notificationService;

    @Override
    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications(
            @Valid @ModelAttribute GetNotificationsRequest request
    ) {
        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        NotificationListDto dto = notificationService.getNotifications(
                myMemberId,
                request.getPage(),
                request.getSize()
        );

        return ResponseEntity.ok(NotificationListResponse.from(dto));
    }

    @Override
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<MarkAsReadResponse> markAsRead(
            @PathVariable Long notificationId
    ) {
        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        notificationService.markAsRead(myMemberId, notificationId);

        return ResponseEntity.ok(MarkAsReadResponse.from(notificationId));
    }

    @Override
    @PatchMapping("/read-all")
    public ResponseEntity<MarkAllAsReadResponse> markAllAsRead() {
        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        notificationService.markAllAsRead(myMemberId);

        return ResponseEntity.ok(MarkAllAsReadResponse.create());
    }
}