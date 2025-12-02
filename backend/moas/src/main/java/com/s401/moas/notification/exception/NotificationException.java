package com.s401.moas.notification.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Notification 도메인 예외
 */
public class NotificationException extends BaseException {

    public NotificationException(NotificationErrorCode errorCode) {
        super(errorCode);
    }

    public NotificationException(NotificationErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public NotificationException(NotificationErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public NotificationException(NotificationErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    /**
     * 알림을 찾을 수 없음
     */
    public static NotificationException notificationNotFound(Long notificationId) {
        return new NotificationException(NotificationErrorCode.NOTIFICATION_NOT_FOUND, notificationId);
    }

    /**
     * 알림 접근 권한 없음
     */
    public static NotificationException notificationAccessDenied() {
        return new NotificationException(NotificationErrorCode.NOTIFICATION_ACCESS_DENIED);
    }
}