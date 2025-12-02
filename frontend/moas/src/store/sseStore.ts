import { create } from 'zustand';
import { tokenManager } from '@/lib/token';

interface SSEStore {
  isConnected: boolean;
  sseController: AbortController | null;
  reconnectTimeout: NodeJS.Timeout | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  // Actions
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  setConnected: (connected: boolean) => void;

  // Event handlers (can be set by app)
  onChatMessage?: (data: any) => void;
  onMessageRead?: (data: any) => void;
  onNotification?: (data: any) => void;
  setEventHandlers: (handlers: {
    onChatMessage?: (data: any) => void;
    onMessageRead?: (data: any) => void;
    onNotification?: (data: any) => void;
  }) => void;
}

export const useSSEStore = create<SSEStore>((set, get) => ({
  isConnected: false,
  sseController: null,
  reconnectTimeout: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setEventHandlers: (handlers) => set(handlers),

  disconnect: () => {
    // console.log('🔌 SSE 연결 해제');

    const state = get();

    // Clear reconnect timeout
    if (state.reconnectTimeout) {
      clearTimeout(state.reconnectTimeout);
    }

    // Abort connection
    if (state.sseController) {
      state.sseController.abort();
    }

    set({
      isConnected: false,
      sseController: null,
      reconnectTimeout: null,
      reconnectAttempts: 0,
    });
  },

  connect: async () => {
    const state = get();

    // Don't connect if already connected
    if (state.sseController) {
      // console.log('⚠️ SSE already connected');
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      // console.log('⚠️ No token available for SSE connection');
      return;
    }

    const controller = new AbortController();
    set({ sseController: controller });

    // console.log('🔄 SSE 연결 시도 중...');

    const scheduleReconnect = () => {
      const currentState = get();

      if (currentState.reconnectAttempts >= currentState.maxReconnectAttempts) {
        // console.log('❌ 최대 재연결 시도 횟수 초과');
        return;
      }

      const newAttempts = currentState.reconnectAttempts + 1;
      const delay = Math.min(1000 * Math.pow(2, newAttempts), 30000);

      // console.log(
      //   `🔄 ${delay}ms 후 재연결 시도 (${newAttempts}/${currentState.maxReconnectAttempts})`,
      // );

      const timeout = setTimeout(() => {
        get().connect();
      }, delay);

      set({
        reconnectAttempts: newAttempts,
        reconnectTimeout: timeout,
      });
    };

    try {
      // const response = await fetch('http://localhost:8080/api/stream', {
      const response = await fetch('https://k13s401.p.ssafy.io/api/stream', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      // console.log('✅ SSE 연결 성공');
      set({ isConnected: true, reconnectAttempts: 0 });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // console.log('📡 SSE 스트림 종료');
              set({ isConnected: false });

              // Attempt to reconnect if not manually disconnected
              if (get().sseController) {
                scheduleReconnect();
              }
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
                  // console.log('✅ SSE 초기 연결 확인');
                } else {
                  try {
                    const parsed = JSON.parse(eventData);
                    const currentState = get();

                    switch (eventType) {
                      case 'chat_message':
                        // console.log('💬 채팅 메시지:', parsed);
                        currentState.onChatMessage?.(parsed);
                        // Also dispatch custom event for components
                        window.dispatchEvent(
                          new CustomEvent('sse-chat-message', { detail: parsed }),
                        );
                        break;
                      // case 'message_read':
                      //   console.log('👁️ 메시지 읽음:', parsed);
                      //   currentState.onMessageRead?.(parsed);
                      //   window.dispatchEvent(
                      //     new CustomEvent('sse-message-read', { detail: parsed }),
                      //   );
                      //   break;
                      case 'notification':
                        // console.log('🔔 알림:', parsed);
                        currentState.onNotification?.(parsed);
                        window.dispatchEvent(
                          new CustomEvent('sse-notification', { detail: parsed }),
                        );
                        break;
                      default:
                        console.log('📨 Unknown event type:', eventType, parsed);
                    }
                  } catch (error) {
                    console.error('❌ SSE 데이터 파싱 실패:', error);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('❌ SSE 스트림 읽기 에러:', error);
            set({ isConnected: false });
            scheduleReconnect();
          }
        }
      };

      readStream();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('🛑 SSE 연결이 중단되었습니다');
        } else {
          console.error('❌ SSE 연결 에러:', error);
          set({ isConnected: false });
          scheduleReconnect();
        }
      }
    }
  },

  reconnect: () => {
    get().disconnect();
    setTimeout(() => {
      get().connect();
    }, 100);
  },
}));
