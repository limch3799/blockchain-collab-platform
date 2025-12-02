// src/components/layout/notification/NotificationItems.tsx
import type { ProcessedNotification } from '@/api/notification';
import type { ReactElement } from 'react';

interface NotificationItemProps {
  notification: ProcessedNotification;
  onClick: () => void;
  onReadToggle: (e: React.MouseEvent) => void;
}

// date-fns 없이 시간 포맷팅
function formatTimeAgo(dateString: string) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}주 전`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}년 전`;
  } catch {
    return '방금 전';
  }
}

// 알림 메시지를 HTML로 변환 (굵은 글씨 처리)
function formatNotificationMessage(message: string): ReactElement {
  // [...]는 굵게, {...}는 moas-artist 색상으로 표시
  const parts = message.split(/(\[[^\]]+\]|\{[^}]+\})/g);

  return (
    <>
      {parts.map((part, index) => {
        // 대괄호로 감싸진 부분 (프로젝트명, 포지션명 등)
        if (part.match(/\[[^\]]+\]/)) {
          return (
            <span key={index} className="font-extrabold">
              {part}
            </span>
          );
        }
        // 중괄호로 감싸진 부분 (닉네임)
        if (part.match(/\{[^}]+\}/)) {
          const nickname = part.slice(1, -1); // 중괄호 제거
          return (
            <span key={index} className="font-extrabold text-moas-artist">
              {nickname}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

// 통합 알림 아이템 컴포넌트
export function NotificationItem({ notification, onClick, onReadToggle }: NotificationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
        !notification.isRead ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 알림 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{formatNotificationMessage(notification.message)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
        </div>

        {/* 읽음 여부 표시 */}
        {!notification.isRead && (
          <button
            onClick={onReadToggle}
            className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 hover:bg-red-600 transition-colors"
            aria-label="읽음 표시"
          />
        )}
        {notification.isRead && (
          <button
            onClick={onReadToggle}
            className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0 hover:bg-red-500 transition-colors"
            aria-label="안읽음으로 표시"
          />
        )}
      </div>
    </div>
  );
}
