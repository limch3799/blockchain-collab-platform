import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useSSEStore } from '@/store/sseStore';
import { useAuth } from '@/hooks/useAuth';

import { router } from './routes';
// import { TestLoginFloatingButton } from '@/components/layout/TestLoginFloatingButton';

function App() {
  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();

  const connect = useSSEStore((state) => state.connect);
  const disconnect = useSSEStore((state) => state.disconnect);
  const setEventHandlers = useSSEStore((state) => state.setEventHandlers);

  // Set up event handlers once
  useEffect(() => {
    const handleNotification = (data: any) => {
      // console.log('🔔 Global notification:', data);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('새 알림', {
          body: data.message || '새로운 알림이 있습니다',
          icon: '/notification-icon.png',
        });
      }
    };

    setEventHandlers({
      onNotification: handleNotification,
    });
  }, [setEventHandlers]);

  // Connect/disconnect SSE based on auth status
  useEffect(() => {
    if (userInfo) {
      // console.log('✅ User logged in, connecting SSE');
      connect();
    } else {
      // console.log('❌ User not logged in, disconnecting SSE');
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [userInfo?.memberId, connect, disconnect]); // Only reconnect if user ID changes

  return (
    <>
      <RouterProvider router={router} />
      {/* <TestLoginFloatingButton /> */}
    </>
  );
}

export default App;
