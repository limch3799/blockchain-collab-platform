package com.s401.moas.notification.service;

import com.s401.moas.global.sse.service.SseService;
import com.s401.moas.global.sse.service.dto.NotificationEventDto;
import com.s401.moas.notification.domain.Notification;
import com.s401.moas.notification.exception.NotificationException;
import com.s401.moas.notification.repository.NotificationRepository;
import com.s401.moas.notification.service.dto.NotificationListDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseService sseService;
    /**
     *  알림 생성 (다른 도메인에서 호출)
     */
    @Transactional
    public void createNotification(Integer memberId, String alarmType, Long relatedId) {
        log.info("알림 생성: memberId={}, alarmType={}, relatedId={}", memberId, alarmType, relatedId);

        Notification notification = Notification.builder()
                .memberId(memberId)
                .alarmType(alarmType)
                .relatedId(relatedId)
                .build();

        notificationRepository.save(notification);

        log.info("알림 생성 완료: notificationId={}", notification.getId());

        // ✅ SSE로 알림 전송
        sseService.send(
                memberId,
                "notification",
                NotificationEventDto.builder()
                        .notificationId(notification.getId())
                        .alarmType(alarmType)
                        .relatedId(relatedId)
                        .build()
        );

        log.info("SSE 알림 전송 완료: memberId={}, notificationId={}", memberId, notification.getId());
    }

    /**
     * 알림 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public NotificationListDto getNotifications(Integer myMemberId, Integer page, Integer size) {
        log.info("알림 목록 조회: memberId={}, page={}, size={}", myMemberId, page, size);

        Pageable pageable = PageRequest.of(page, size);
        List<Notification> notifications = notificationRepository
                .findByMemberIdOrderByIdDesc(myMemberId, pageable);

        List<NotificationListDto.NotificationItemDto> notificationItems = notifications.stream()
                .map(notification -> NotificationListDto.NotificationItemDto.builder()
                        .notificationId(notification.getId())
                        .alarmType(notification.getAlarmType())
                        .relatedId(notification.getRelatedId())
                        .isRead(notification.getIsRead())
                        .createdAt(notification.getCreatedAt())
                        .build())
                .toList();

        log.info("알림 목록 조회 완료: count={}", notificationItems.size());

        return NotificationListDto.builder()
                .notifications(notificationItems)
                .build();
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Integer myMemberId, Long notificationId) {
        log.info("알림 읽음 처리: memberId={}, notificationId={}", myMemberId, notificationId);

        // 1. 알림 조회 및 권한 확인
        Notification notification = notificationRepository.findByIdAndMemberId(notificationId, myMemberId)
                .orElseThrow(() -> NotificationException.notificationNotFound(notificationId));

        // 2. 읽음 처리
        notification.markAsRead();

        log.info("알림 읽음 처리 완료: notificationId={}", notificationId);
    }

    /**
     * 전체 알림 읽음 처리
     */
    @Transactional
    public void markAllAsRead(Integer myMemberId) {
        log.info("전체 알림 읽음 처리: memberId={}", myMemberId);

        int updatedCount = notificationRepository.markAllAsReadByMemberId(myMemberId);

        log.info("전체 알림 읽음 처리 완료: memberId={}, updatedCount={}", myMemberId, updatedCount);
    }

    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(Integer myMemberId, Long notificationId) {
        log.info("알림 삭제: memberId={}, notificationId={}", myMemberId, notificationId);

        // 1. 알림 조회 및 권한 확인
        Notification notification = notificationRepository.findByIdAndMemberId(notificationId, myMemberId)
                .orElseThrow(() -> NotificationException.notificationNotFound(notificationId));

        // 2. 삭제
        notificationRepository.delete(notification);

        log.info("알림 삭제 완료: notificationId={}", notificationId);
    }
}