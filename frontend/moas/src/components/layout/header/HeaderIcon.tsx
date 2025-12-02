// src/components/layout/HeaderIcon.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChatUnreadStore } from '@/store/chatUnreadStore';
import { NotificationModal } from '../../layout/notification/NotificationModal';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  processNotification,
  type ProcessedNotification,
} from '@/api/notification';

import NotiOn from '@/assets/header/noti_on.png';
import NotiOff from '@/assets/header/noti_off.png';
import ChatOn from '@/assets/header/chat_on.png';
import ChatOff from '@/assets/header/chat_off.png';
import Bookmark from '@/assets/header/bookmark.png';

const NOTIFICATION_FETCH_KEY = 'lastNotificationFetch';
const NOTIFICATION_CACHE_KEY = 'cachedNotifications';
//const FETCH_INTERVAL = 60000; // 1분 (밀리초)
const FETCH_INTERVAL = 3000; // 3초 (밀리초)
export function HeaderIcon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();

  // Chat unread state from store
  const hasUnreadChat = useChatUnreadStore((state) => state.hasUnread);
  const checkUnreadMessages = useChatUnreadStore((state) => state.checkUnreadMessages);

  // 알림 모달 상태
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<ProcessedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 애니메이션 상태 - 페이지 리로드 시에만 실행
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // 읽지 않은 알림 개수 (null 체크 추가)
  const unreadNotificationCount = notifications.filter((n) => n && !n.isRead).length;

  // 로컬스토리지에서 캐시된 알림 불러오기 (null 필터링 추가)
  const loadCachedNotifications = () => {
    try {
      const cached = localStorage.getItem(NOTIFICATION_CACHE_KEY);
      if (cached) {
        const parsedNotifications = JSON.parse(cached);

        // null 값 필터링
        const validNotifications = (parsedNotifications as (ProcessedNotification | null)[]).filter(
          (notif): notif is ProcessedNotification => notif !== null,
        );
        setNotifications(validNotifications);
      }
    } catch (error) {
      console.error('캐시된 알림 로딩 실패:', error);
      // 캐시 로딩 실패 시 캐시 초기화
      localStorage.removeItem(NOTIFICATION_CACHE_KEY);
    }
  };

  // 로컬스토리지에 알림 저장
  const saveNotificationsToCache = (notifs: ProcessedNotification[]) => {
    try {
      localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('알림 캐싱 실패:', error);
    }
  };

  // 알림 데이터 가져오기
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // API 호출
      const response = await getNotifications({ size: 20 });

      // 각 알림을 처리하여 메시지와 링크 생성 (null 필터링)
      const processedNotificationsWithNull = await Promise.all(
        response.notifications.map((rawNotif) => processNotification(rawNotif)),
      );

      // null 값 필터링 (9번 알림 및 오류 발생한 알림 제외)
      const processedNotifications = processedNotificationsWithNull.filter(
        (notif): notif is ProcessedNotification => notif !== null,
      );
      setNotifications(processedNotifications);

      // 로컬스토리지에 저장
      saveNotificationsToCache(processedNotifications);

      // 마지막 호출 시간 저장
      localStorage.setItem(NOTIFICATION_FETCH_KEY, Date.now().toString());
    } catch (error) {
      console.error('알림 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for unread chat messages on mount
  useEffect(() => {
    if (userInfo?.memberId) {
      checkUnreadMessages();
    }
  }, [userInfo?.memberId, checkUnreadMessages]);

  // Listen for SSE chat message events
  useEffect(() => {
    const handleChatMessage = () => {
      // console.log('💬 Chat message event in HeaderIcon:', customEvent.detail);

      // Only show indicator if not currently on chat page
      if (!location.pathname.includes('/chat')) {
        // Check unread messages to update the indicator
        checkUnreadMessages();
      }
    };

    window.addEventListener('sse-chat-message', handleChatMessage);

    return () => {
      window.removeEventListener('sse-chat-message', handleChatMessage);
    };
  }, [location.pathname, checkUnreadMessages]);

  // 초기 로딩 (로그인 시 & 새로고침 시)
  useEffect(() => {
    // 먼저 캐시된 알림 로드
    loadCachedNotifications();

    const shouldFetch = () => {
      const lastFetch = localStorage.getItem(NOTIFICATION_FETCH_KEY);
      if (!lastFetch) return true; // 처음 로드
      const lastFetchTime = parseInt(lastFetch, 10);
      const now = Date.now();
      return now - lastFetchTime >= FETCH_INTERVAL; // 1분 이상 차이
    };

    if (shouldFetch()) {
      fetchNotifications();
    }

    // 페이지 리로드 시 알림 아이콘 애니메이션
    if (location.pathname === '/') {
      // 약간의 딜레이 후 애니메이션 시작
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        // 애니메이션 완료 후 상태 리셋 (2초 = 한 번 바운스)
        setTimeout(() => setShouldAnimate(false), 2000);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userInfo?.memberId]); // 로그인 사용자가 바뀔 때마다 실행

  // 알림 토글
  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // 알림 클릭
  const handleNotificationClick = (notification: ProcessedNotification) => {
    navigate(notification.link);
    setIsNotificationOpen(false);
  };

  // 알림 읽음 토글
  const handleNotificationRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);

      // 로컬 상태 업데이트
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, isRead: !n.isRead } : n,
      );
      setNotifications(updatedNotifications);

      // 로컬스토리지에도 업데이트된 상태 저장
      saveNotificationsToCache(updatedNotifications);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      // 로컬 상태 업데이트
      const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updatedNotifications);

      // 로컬스토리지에도 업데이트된 상태 저장
      saveNotificationsToCache(updatedNotifications);
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error);
    }
  };

  // 채팅 클릭
  const handleChatClick = () => {
    navigate('/chat');
  };

  // 북마크 클릭
  const handleBookmarkClick = () => {
    navigate('/my-bookmark');
  };

  return (
    <>
      <nav className="flex items-center gap-3 text-sm relative">
        {/* 일반 알림 아이콘 */}
        <div className="relative">
          <button
            onClick={handleNotificationToggle}
            className="flex items-center focus:outline-none relative"
            disabled={isLoading}
          >
            <img
              src={unreadNotificationCount > 0 ? NotiOn : NotiOff}
              alt="notification icon"
              className="h-6 w-auto transition-opacity duration-200"
            />
            {unreadNotificationCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  shouldAnimate ? 'animate-notification-bounce' : ''
                }`}
              >
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleNotificationRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>

        {/* 채팅 알림 아이콘 - SSE 연동 */}
        <div className="relative">
          <button
            onClick={handleChatClick}
            className="flex items-center focus:outline-none relative"
          >
            <img
              src={hasUnreadChat ? ChatOn : ChatOff}
              alt="chat icon"
              className="h-6 w-auto transition-opacity duration-200"
            />
          </button>
        </div>

        {/* 북마크 아이콘 */}
        <button onClick={handleBookmarkClick} className="flex items-center focus:outline-none">
          <img
            src={Bookmark}
            alt="bookmark icon"
            className="h-6 w-auto transition-opacity duration-200"
          />
        </button>
      </nav>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes notification-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-4px);
          }
          50% {
            transform: translateY(0);
          }
          75% {
            transform: translateY(-4px);
          }
        }

        .animate-notification-bounce {
          animation: notification-bounce 1.2s ease-in-out;
        }
      `}</style>
    </>
  );
}
