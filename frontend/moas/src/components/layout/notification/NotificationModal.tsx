// src/components/layout/notification/NotificationModal.tsx
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { NotificationItem } from './NotificationItems';
import type { ProcessedNotification } from '@/api/notification';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ProcessedNotification[];
  onNotificationClick: (notification: ProcessedNotification) => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 모달이 열릴 때마다 displayCount 초기화
  useEffect(() => {
    if (isOpen) {
      setDisplayCount(20);
    }
  }, [isOpen]);

  // 스크롤 이벤트 핸들러 (무한 스크롤)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && displayCount < notifications.length) {
      // 20개씩 추가
      const nextCount = Math.min(displayCount + 20, notifications.length);
      setDisplayCount(nextCount);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications = notifications.slice(0, displayCount);

  return (
    <div
      ref={modalRef}
      className="absolute top-12 right-0 w-96 h-[360px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 font-pretendard flex flex-col"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">알림</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 모두 읽음 처리 버튼 */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-moas-main hover:text-moas-main/80 font-medium transition-colors"
            >
              모두 읽음
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>알림 없음</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {displayedNotifications.map((notification) => {
                const handleClick = () => {
                  onNotificationClick(notification);
                  if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                  }
                };

                const handleReadToggle = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                };

                return (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleClick}
                    onReadToggle={handleReadToggle}
                  />
                );
              })}
            </div>

            {/* 로딩 인디케이터 또는 끝 메시지 */}
            {displayCount < notifications.length ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                <div className="animate-pulse">더 불러오는 중...</div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">
                <p>더 이상 알림이 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
