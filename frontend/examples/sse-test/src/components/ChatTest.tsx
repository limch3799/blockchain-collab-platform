import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface ChatMessageEvent {
  roomId: number;
  messageId: number;
}

interface NotificationEvent {
  notificationId: number;
  alarmType: string;
  relatedId: number;
}

interface Message {
  messageId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

interface ChatRoom {
  chatroomId: number;
  projectId: number;
  projectTitle: string;
  otherMemberId: number;
  otherMemberName: string;
  otherMemberProfileUrl: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isBlockedByMe: boolean;
  myApplicationStatus: string;
  myApplicationPosition: string;
}

interface Notification {
  notificationId: number;
  alarmType: string;
  relatedId: number;
  isRead: boolean;
  createdAt: string;
}

export default function ChatTest() {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sseEvents, setSseEvents] = useState<ChatMessageEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEvents, setNotificationEvents] = useState<NotificationEvent[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // SSE 연결 해제
  const disconnectSSE = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsConnected(false);
      console.log('SSE 연결 해제');
    }
  }, [abortController]);

  // SSE 연결
  // const connectSSE = () => {
  //   if (isConnected) return;

  //   // const token = api.defaults.headers.common['Authorization'];
  //   // const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
  //   const rawAuthHeader = api.defaults.headers.common['Authorization'];
  //   const token = typeof rawAuthHeader === 'string' ? rawAuthHeader.replace('Bearer ', '') : '';

  //   if (!token) {
  //     alert('토큰을 먼저 설정하세요!');
  //     return;
  //   }

  //   console.log('SSE 연결 시도 중...');

  //   // const eventSource = new EventSource('https://k13s401.p.ssafy.io/api/stream', {
  //   //   withCredentials: true,
  //   // });
  //   const eventSource = new EventSource(`https://k13s401.p.ssafy.io/api/stream?token=${token}`, {
  //     withCredentials: true,
  //   });

  //   eventSource.onopen = () => {
  //     console.log('✅ SSE 연결 성공!');
  //     setIsConnected(true);
  //   };

  //   eventSource.onerror = (err) => {
  //     console.error('SSE 에러:', err);
  //     eventSource.close();
  //     setIsConnected(false);
  //   };

  //   eventSource.addEventListener('chat_message', (event) => {
  //     const parsed = JSON.parse(event.data);
  //     console.log('✅ 채팅 메시지:', parsed);
  //     setSseEvents((prev) => [parsed, ...prev]);
  //     fetchChatRooms();
  //     if (selectedRoomId === parsed.roomId) fetchMessages(parsed.roomId);
  //   });

  //   eventSource.addEventListener('notification', (event) => {
  //     const parsed = JSON.parse(event.data);
  //     console.log('🔔 알림 수신:', parsed);
  //     setNotificationEvents((prev) => [parsed, ...prev]);
  //     fetchNotifications();
  //   });

  //   // 저장해두기 (for disconnect)
  //   setAbortController({ abort: () => eventSource.close() } as any);
  // };

  // SSE 연결
  // const connectSSE = async () => {
  //   const controller = new AbortController();
  //   setAbortController(controller);

  //   try {
  //     const token = api.defaults.headers.common['Authorization'];

  //     if (!token) {
  //       alert('토큰을 먼저 설정하세요!');
  //       return;
  //     }

  //     console.log('SSE 연결 시도 중...');
  //     console.log('Token:', token);

  //     // Add timeout
  //     const timeout = setTimeout(() => {
  //       console.error('SSE 연결 타임아웃 (30초)');
  //       controller.abort();
  //     }, 30000);

  //     const response = await fetch('https://k13s401.p.ssafy.io/api/stream', {
  //       method: 'GET',
  //       headers: {
  //         Authorization: token as string,
  //         Accept: 'text/event-stream',
  //         'Cache-Control': 'no-cache',
  //       },
  //       signal: controller.signal,
  //     });

  //     clearTimeout(timeout);
  //     console.log('connectSSE response status:', response.status);
  //     console.log('connectSSE response headers:', Object.fromEntries(response.headers.entries()));
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       if (error.name === 'AbortError') {
  //         console.log('SSE 연결이 사용자에 의해 중단되었습니다');
  //       } else {
  //         console.error('SSE 연결 에러:', error);
  //         alert('SSE 연결 실패: ' + error.message);
  //       }
  //     }
  //     setIsConnected(false);
  //   }
  // };

  const connectSSE = async () => {
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = api.defaults.headers.common['Authorization'];

      if (!token) {
        alert('토큰을 먼저 설정하세요!');
        return;
      }

      console.log('SSE 연결 시도 중...');

      // const response = await fetch('http://localhost:8080/api/stream', {
      const response = await fetch('https://k13s401.p.ssafy.io/api/stream', {
        method: 'GET',
        headers: {
          Authorization: token as string,
        },
        signal: controller.signal,
      });

      console.log('connectSSE response: ', response);

      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      console.log('SSE 연결 성공!');
      setIsConnected(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream을 사용할 수 없습니다');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('SSE 스트림 종료');
          setIsConnected(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          if (!event.trim()) continue;

          const lines = event.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.substring(5).trim();
            }
          }

          if (eventData) {
            if (eventData === 'connected') {
              console.log('✅ SSE 초기 연결 확인');
            } else if (eventType === 'chat_message') {
              // 채팅 메시지 처리
              try {
                const parsed = JSON.parse(eventData);
                console.log('✅ 채팅 메시지:', parsed);
                setSseEvents((prev) => [parsed, ...prev]);

                // 채팅방 목록 업데이트
                fetchChatRooms();

                // 현재 선택된 방이면 메시지도 업데이트
                if (selectedRoomId === parsed.roomId) {
                  fetchMessages(parsed.roomId);
                }
              } catch (error) {
                console.error('채팅 메시지 파싱 실패:', error);
              }
            } else if (eventType === 'notification') {
              // ✅ 알림 처리
              try {
                const parsed = JSON.parse(eventData);
                console.log('🔔 알림 수신:', parsed);
                setNotificationEvents((prev) => [parsed, ...prev]);

                // 알림 목록 새로고침
                fetchNotifications();
              } catch (error) {
                console.error('알림 파싱 실패:', error);
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('SSE 연결이 사용자에 의해 중단되었습니다');
        } else {
          console.error('SSE 연결 에러:', error);
          alert('SSE 연결 실패: ' + error.message);
        }
      }
      setIsConnected(false);
    }
  };

  // 채팅방 목록 조회
  const fetchChatRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      const rooms = response.data.data || [];
      setChatRooms(rooms);
      console.log('채팅방 목록 업데이트:', rooms.length);
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
    }
  };

  // 메시지 조회
  const fetchMessages = async (roomId: number) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      const msgs = response.data.data?.messages || response.data.messages || [];
      setChatMessages(msgs);
      console.log(`메시지 업데이트: roomId=${roomId}, count=${msgs.length}`);
    } catch (error) {
      console.error('메시지 조회 실패:', error);
    }
  };

  // 알림 목록 조회
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', {
        params: { page: 0, size: 20 },
      });
      const notis = response.data.notifications || [];
      setNotifications(notis);
      console.log('알림 목록 업데이트:', notis.length);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    }
  };

  // 채팅방 선택
  const selectRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    fetchMessages(roomId);
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!selectedRoomId) {
      alert('채팅방을 먼저 선택하세요!');
      return;
    }

    if (!messageContent.trim()) {
      alert('메시지를 입력하세요!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', messageContent);

      await api.post(`/chat/rooms/${selectedRoomId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ 메시지 전송 성공');
      setMessageContent('');

      // 내 화면 즉시 업데이트
      fetchMessages(selectedRoomId);
      fetchChatRooms();
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnectSSE();
    };
  }, [disconnectSSE]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchChatRooms();
    fetchNotifications();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>채팅 & 알림 앱</h1>

      {/* SSE 연결 */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#ffe' }}>
        <button onClick={connectSSE} disabled={isConnected}>
          SSE 연결
        </button>
        <button onClick={disconnectSSE} disabled={!isConnected} style={{ marginLeft: '10px' }}>
          SSE 해제
        </button>
        <span style={{ marginLeft: '10px' }}>
          상태: {isConnected ? '✅ 연결됨' : '❌ 연결 안됨'}
        </span>
      </div>

      {/* SSE 이벤트 로그 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* 채팅 SSE 이벤트 */}
        <div style={{ flex: 1, padding: '10px', background: '#f0f0f0' }}>
          <h3>받은 채팅 SSE ({sseEvents.length}개)</h3>
          <div style={{ maxHeight: '120px', overflow: 'auto' }}>
            {sseEvents.length === 0 ? (
              <div>이벤트 없음</div>
            ) : (
              sseEvents.map((msg, index) => (
                <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
                  💬 roomId: {msg.roomId}, messageId: {msg.messageId}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 알림 SSE 이벤트 */}
        <div style={{ flex: 1, padding: '10px', background: '#fff3e0' }}>
          <h3>받은 알림 SSE ({notificationEvents.length}개)</h3>
          <div style={{ maxHeight: '120px', overflow: 'auto' }}>
            {notificationEvents.length === 0 ? (
              <div>이벤트 없음</div>
            ) : (
              notificationEvents.map((noti, index) => (
                <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
                  🔔 [{noti.alarmType}] ID: {noti.notificationId}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 왼쪽: 채팅방 목록 */}
        <div style={{ width: '350px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>채팅방 목록 ({chatRooms.length})</h3>
          <button onClick={fetchChatRooms} style={{ marginBottom: '10px' }}>
            🔄 새로고침
          </button>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {chatRooms.length === 0 ? (
              <div>채팅방이 없습니다</div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.chatroomId}
                  onClick={() => selectRoom(room.chatroomId)}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: selectedRoomId === room.chatroomId ? '#e3f2fd' : '#fafafa',
                    border:
                      selectedRoomId === room.chatroomId ? '2px solid #2196f3' : '1px solid #eee',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{room.projectTitle}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                    상대: {room.otherMemberName}
                  </div>
                  {room.lastMessage && (
                    <div style={{ fontSize: '12px', color: '#999' }}>{room.lastMessage}</div>
                  )}
                  {room.unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#f44336',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    >
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 중간: 메시지 목록 */}
        <div
          style={{
            flex: 1,
            border: '1px solid #ddd',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {selectedRoomId ? (
            <>
              <h3>채팅방 #{selectedRoomId}</h3>

              {/* 메시지 목록 */}
              <div
                style={{
                  flex: 1,
                  maxHeight: '400px',
                  overflow: 'auto',
                  background: '#f9f9f9',
                  padding: '10px',
                  marginBottom: '10px',
                }}
              >
                {chatMessages.length === 0 ? (
                  <div>메시지가 없습니다</div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.messageId}
                      style={{
                        marginBottom: '10px',
                        padding: '10px',
                        background: 'white',
                        borderRadius: '5px',
                      }}
                    >
                      <div style={{ marginBottom: '5px' }}>
                        <strong>{msg.senderName}</strong>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                          ({msg.senderId})
                        </span>
                      </div>
                      <div style={{ marginBottom: '5px' }}>{msg.content}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 메시지 입력 */}
              <div>
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="메시지 입력"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{ width: '70%', padding: '10px', marginRight: '10px' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
                  전송
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', paddingTop: '50px' }}>
              채팅방을 선택해주세요
            </div>
          )}
        </div>

        {/* 오른쪽: 알림 목록 */}
        <div style={{ width: '300px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>알림 목록 ({notifications.length})</h3>
          <button onClick={fetchNotifications} style={{ marginBottom: '10px' }}>
            🔄 새로고침
          </button>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <div>알림이 없습니다</div>
            ) : (
              notifications.map((noti) => (
                <div
                  key={noti.notificationId}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: noti.isRead ? '#fafafa' : '#fff3cd',
                    border: '1px solid #eee',
                    borderRadius: '5px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>
                    {noti.alarmType}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    관련 ID: {noti.relatedId}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {new Date(noti.createdAt).toLocaleString()}
                  </div>
                  {!noti.isRead && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#ff6b6b',
                        fontWeight: 'bold',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}