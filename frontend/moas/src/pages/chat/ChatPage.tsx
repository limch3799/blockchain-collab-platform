import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Send,
  User,
  X,
} from 'lucide-react';

import apiClient from '@/api/axios';
import type {
  ChatMessagesResponse,
  ChatRoom,
  ChatRoomResponse,
  CreateChatRoomResponse,
  Message,
  StatusBadge,
} from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import { formatTime } from '@/lib/timeUtils';
import { formatDate, parseJavaLocalDateTime } from '@/lib/dateUtils';
import { formatFileSize } from '@/lib/fileUtils';
import { useChatUnreadStore } from '@/store/chatUnreadStore';
import { getProjectById } from '@/api/project';
import defaultProfileIcon from '@/assets/header/default_profile/default_profile_1.png';

// TODO: 메시지 무한 스크롤
// TODO: isMobileView 일 때, 선택된 방이 없으면 방 목록 표시하기
// TODO: menuRef 버그 고치기
// TODO: change selectedRoom to selectedRoomId?
// TODO: 채팅방이 열려있을 때, 새로운 메시지가 오면 왼쪽 빨간색 알림수 생기면 안됨

interface PendingChatInfo {
  projectId: number;
  otherMemberId: number;
  projectTitle?: string;
  otherMemberName?: string;
  otherMemberProfileUrl?: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, otherMemberId, projectTitle, otherMemberName, otherMemberProfileUrl } =
    useLocation().state || {};

  const markAsViewed = useChatUnreadStore((state) => state.markAsViewed);

  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();
  const userId = userInfo?.memberId;
  const isArtist = userInfo?.role === 'ARTIST';

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [canSendMessage, setCanSendMessage] = useState<boolean>(true);
  const [pendingChat, setPendingChat] = useState<PendingChatInfo | null>(null);

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [hoverRoomId, setHoverRoomId] = useState<number | null>(null);
  const [shownMenuRoomId, setShownMenuRoomId] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showRoomList, setShowRoomList] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevRoomIdRef = useRef<number | null>(null);
  const prevMessagesRef = useRef<number | null>(null);
  const selectedRoomRef = useRef<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [projectInfo, setProjectInfo] = useState<{
    projectId: number;
    title: string;
    thumbnailUrl: string | null;
  } | null>(null);

  // Clear unread indicator when chat page is opened
  useEffect(() => {
    markAsViewed();
  }, [markAsViewed]);

  // Also update the SSE chat message handler to not increment unread count
  // if the message is for the currently selected room

  // Listen for SSE events via custom events
  useEffect(() => {
    const handleChatMessage = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      await loadChatRooms(true);

      if (selectedRoomRef.current && selectedRoomRef.current.chatroomId === data.roomId) {
        loadMessages(data.roomId, true);

        setChatRooms((prev) =>
          prev.map((room) =>
            room.chatroomId === data.roomId ? { ...room, unreadCount: 0 } : room,
          ),
        );
      }
    };

    const handleMessageRead = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      if (selectedRoomRef.current && selectedRoomRef.current.chatroomId === data.roomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageId <= data.lastReadMessageId ? { ...msg, isRead: true } : msg,
          ),
        );
      }
    };

    window.addEventListener('sse-chat-message', handleChatMessage);
    window.addEventListener('sse-message-read', handleMessageRead);

    return () => {
      window.removeEventListener('sse-chat-message', handleChatMessage);
      window.removeEventListener('sse-message-read', handleMessageRead);
    };
  }, []);

  // 선택된 방(selectedRoom)이 바꾸면 ref 업데이트
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shownMenuRoomId !== null) {
        const menuElement = menuRefs.current[shownMenuRoomId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setShowMenu(false);
          setShownMenuRoomId(null);
        }
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, shownMenuRoomId]);

  // 채팅 방 목록 불러오기 (optimistic update 지원)
  const loadChatRooms = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await apiClient.get<ChatRoomResponse>('/chat/rooms');

      const roomsWithDates = response.data.data.map((room) => ({
        ...room,
        lastMessageAt: room.lastMessageAt ? parseJavaLocalDateTime(room.lastMessageAt) : null,
      }));

      // console.log('loadChatRooms roomsWithDates', JSON.stringify(roomsWithDates, null, 2));

      setChatRooms(roomsWithDates);
    } catch (err: any) {
      console.error('Failed to load chat rooms:', err);
      if (!silent) {
        setError(err.response?.data?.message || '채팅방 목록을 불러올 수 없습니다.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 채팅 방 메시지 불러오기 (optimistic update 지원)
  const loadMessages = async (chatroomId: number, silent: boolean = false) => {
    try {
      const response = await apiClient.get<ChatMessagesResponse>(
        `/chat/rooms/${chatroomId}/messages`,
        {
          params: {
            size: 20 /*lastMessageId (커서 기준 메시지 ID (이 ID보다 이전 메시지 조회)) */,
          },
        },
      );

      const { messages: rawMessages, otherLastReadMessageId } = response.data.data;

      const messagesWithDates = rawMessages.map((msg) => {
        return {
          ...msg,
          createdAt: parseJavaLocalDateTime(msg.createdAt),
          isRead: msg.messageId <= otherLastReadMessageId,
        };
      });

      setMessages(messagesWithDates.reverse());
      setCanSendMessage(response.data.data.canSendMessage);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      if (!silent) {
        setError(err.response?.data?.message || '메시지를 불러올 수 없습니다.');
      }
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<ChatRoomResponse>('/chat/rooms');
        const roomsWithDates = response.data.data.map((room) => ({
          ...room,
          lastMessageAt: room.lastMessageAt ? parseJavaLocalDateTime(room.lastMessageAt) : null,
        }));

        // console.log('initializeChat roomsWithDates', JSON.stringify(roomsWithDates, null, 2));

        setChatRooms(roomsWithDates);

        // If navigating with state to start a new chat
        if (projectId && otherMemberId) {
          const pId = parseInt(projectId, 10);
          const oId = parseInt(otherMemberId, 10);

          const existingRoom = roomsWithDates.find(
            (room) => room.projectId === pId && room.otherMemberId === oId,
          );

          if (existingRoom) {
            // If chat room already exists, select it
            setSelectedRoom(existingRoom);
          } else {
            // If not, set as pending chat
            setPendingChat({
              projectId: pId,
              otherMemberId: oId,
              projectTitle: projectTitle || '프로젝트',
              otherMemberName: otherMemberName || '사용자',
              otherMemberProfileUrl: otherMemberProfileUrl,
            });

            loadProjectInfo(pId);
          }

          if (window.innerWidth < 768) {
            setShowRoomList(false);
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize chat:', err);
        setError(err.response?.data?.message || '채팅을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [projectId, otherMemberId, projectTitle, otherMemberName, otherMemberProfileUrl]);

  // 채팅 방 선택 시 메시지 불러오기
  useEffect(() => {
    if (selectedRoom) {
      setPendingChat(null);
      loadMessages(selectedRoom.chatroomId);
    }
  }, [selectedRoom]);

  // Add a useEffect to periodically fetch messages when viewing a room
  useEffect(() => {
    if (!selectedRoom) return;

    // Initial load is already handled in the other useEffect
    // Set up polling to mark messages as read while viewing the chat
    const interval = setInterval(() => {
      // Fetch messages silently - backend should mark them as read
      loadMessages(selectedRoom.chatroomId, true);
    }, 3000); // Poll every 3 seconds while chat is open

    return () => clearInterval(interval);
  }, [selectedRoom?.chatroomId]);

  useEffect(() => {
    const currentRoomId = selectedRoom?.chatroomId;

    // Condition 1: room changed
    const roomChanged = currentRoomId && prevRoomIdRef.current !== currentRoomId;

    // Condition 2: new messages added
    const newMessagesAdded =
      messages.length > 0 && messages[messages.length - 1].messageId !== prevMessagesRef.current;

    if (roomChanged) {
      scrollToBottom('instant');
    } else if (newMessagesAdded) {
      scrollToBottom('smooth');
    }

    // Update refs
    prevRoomIdRef.current = currentRoomId || null;
    prevMessagesRef.current = messages.length > 0 ? messages[messages.length - 1].messageId : null;
  }, [selectedRoom?.chatroomId, messages]);

  // 화면 사이즈 관련
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      setShowRoomList(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 스크롤 맨 아래로 이동
  const scrollToBottom = (behavior: 'smooth' | 'instant') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 채팅 방 선택 핸들러
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setPendingChat(null);

    // ⭐ 프로젝트 정보 초기화 추가 ⭐
    setProjectInfo(null);

    // 프로젝트 정보 로드 추가
    loadProjectInfo(room.projectId);

    // 기존 코드 유지
    if (room.unreadCount > 0) {
      setChatRooms((prev) =>
        prev.map((r) => (r.chatroomId === room.chatroomId ? { ...r, unreadCount: 0 } : r)),
      );
    }

    if (isMobileView) {
      setShowRoomList(false);
    }
  };

  const loadProjectInfo = async (projectId: number) => {
    try {
      const projectDetail = await getProjectById(projectId);
      setProjectInfo({
        projectId: projectDetail.projectId,
        title: projectDetail.title,
        thumbnailUrl: projectDetail.thumbnailUrl,
      });
    } catch (error) {
      console.error('Failed to load project info:', error);
    }
  };

  // 뒤로 가기 핸들러
  const handleBackToList = () => {
    setShowRoomList(true);
    setSelectedRoom(null);
    setPendingChat(null);

    setProjectInfo(null);
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > 100 * 1024 * 1024) {
      alert('파일 용량이 100MB를 초과합니다.');
      return;
    }

    if (files.length > 10) {
      alert('최대 10개의 파일만 첨부할 수 있습니다.');
      return;
    }

    setSelectedFiles(files);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 프로필 보기 핸들러
  const handleViewProfile = (memberId: number) => {
    setShowMenu(false);
    setShownMenuRoomId(null);
    navigate(`/profile/${memberId}`);
  };

  // 새 채팅방 생성 후 메시지 전송
  const createRoomAndSendMessage = async (content: string, files: File[]) => {
    if (!pendingChat) return;

    try {
      setSending(true);

      const createResponse = await apiClient.post<CreateChatRoomResponse>('/chat/rooms', {
        projectId: pendingChat.projectId,
        otherMemberId: pendingChat.otherMemberId,
      });

      const newRoomId = createResponse.data.data.chatroomId;

      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content);
      }
      files.forEach((file) => {
        formData.append('files', file);
      });

      await apiClient.post(`/chat/rooms/${newRoomId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Silently reload rooms to get the new room
      await loadChatRooms(true);

      const response = await apiClient.get<ChatRoomResponse>('/chat/rooms');
      const roomsWithDates = response.data.data.map((room) => ({
        ...room,
        lastMessageAt: room.lastMessageAt ? parseJavaLocalDateTime(room.lastMessageAt) : null,
      }));
      const newRoom = roomsWithDates.find((room) => room.chatroomId === newRoomId);

      if (newRoom) {
        setSelectedRoom(newRoom);
        setPendingChat(null);
        // Messages will be loaded via SSE, no need to manually reload
        // 프로젝트 정보 로드 추가
        loadProjectInfo(newRoom.projectId);
      }

      setInputMessage('');
      setSelectedFiles([]);
    } catch (err: any) {
      console.error('Failed to create room and send message:', err);
      alert(err.response?.data?.message || '메시지를 전송할 수 없습니다.');
    } finally {
      setSending(false);
    }
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    if (pendingChat) {
      await createRoomAndSendMessage(inputMessage, selectedFiles);
      return;
    }

    if (!selectedRoom) return;

    if (!canSendMessage) {
      alert('메시지를 보낼 수 없습니다.');
      return;
    }

    try {
      setSending(true);

      const formData = new FormData();

      if (inputMessage.trim()) {
        formData.append('content', inputMessage);
      }

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await apiClient.post(`/chat/rooms/${selectedRoom.chatroomId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear input immediately for better UX
      setInputMessage('');
      setSelectedFiles([]);

      // Messages will be updated via SSE, no need to manually reload
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || '메시지를 전송할 수 없습니다.');
    } finally {
      setSending(false);
    }
  };

  // 사용자 차단 핸들러
  const handleBlockUser = async (roomId: number) => {
    try {
      await apiClient.patch(`/chat/rooms/${roomId}/block`);
      setShowMenu(false);
      setShownMenuRoomId(null);

      // Update room in list
      setChatRooms((prev) =>
        prev.map((room) => (room.chatroomId === roomId ? { ...room, isBlockedByMe: true } : room)),
      );

      if (selectedRoom?.chatroomId === roomId) {
        setSelectedRoom({ ...selectedRoom, isBlockedByMe: true });
      }

      alert('차단되었습니다.');
    } catch (err: any) {
      console.error('Failed to block user:', err);
      alert(err.response?.data?.message || '차단할 수 없습니다.');
    }
  };

  // 차단 해제 핸들러
  const handleUnblockUser = async (roomId: number) => {
    try {
      await apiClient.patch(`/chat/rooms/${roomId}/unblock`);
      setShowMenu(false);
      setShownMenuRoomId(null);

      // Update room in list
      setChatRooms((prev) =>
        prev.map((room) => (room.chatroomId === roomId ? { ...room, isBlockedByMe: false } : room)),
      );

      if (selectedRoom?.chatroomId === roomId) {
        setSelectedRoom({ ...selectedRoom, isBlockedByMe: false });
      }

      alert('차단이 해제되었습니다.');
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      alert(err.response?.data?.message || '차단 해제할 수 없습니다.');
    }
  };

  // 방 나가기 핸들러
  const handleLeaveRoom = async (roomId: number) => {
    if (!confirm('채팅방을 나가시겠습니까?')) return;

    try {
      await apiClient.delete(`/chat/rooms/${roomId}`);
      setShowMenu(false);
      setShownMenuRoomId(null);

      // Remove room from list
      setChatRooms((prev) => prev.filter((room) => room.chatroomId !== roomId));

      if (selectedRoom?.chatroomId === roomId) {
        setSelectedRoom(null);
        setShowRoomList(true);
      }

      alert('채팅방을 나갔습니다.');
    } catch (err: any) {
      console.error('Failed to leave room:', err);
      alert(err.response?.data?.message || '채팅방을 나갈 수 없습니다.');
    }
  };

  const getStatusBadge = (
    status: 'OFFERED' | 'PENDING' | 'REJECTED' | null,
  ): StatusBadge | null => {
    const badges: Record<string, StatusBadge> = {
      OFFERED: { text: '오퍼 받음', color: 'bg-green-100 text-green-700' },
      PENDING: { text: '대기중', color: 'bg-yellow-100 text-yellow-700' },
      REJECTED: { text: '거절됨', color: 'bg-red-100 text-red-700' },
    };
    return status ? badges[status] : null;
  };

  const getCurrentUserId = (): number => {
    return userId || 0;
  };

  const displayInfo = pendingChat || selectedRoom;

  const displayedChatRooms = [...chatRooms];
  if (
    pendingChat &&
    !chatRooms.some(
      (room) =>
        room.otherMemberId === pendingChat.otherMemberId &&
        room.projectId === pendingChat.projectId,
    )
  ) {
    const pendingRoom: ChatRoom = {
      chatroomId: -1, // 임시 ID
      projectId: pendingChat.projectId,
      otherMemberId: pendingChat.otherMemberId,
      otherMemberName: pendingChat.otherMemberName || '새 대화',
      otherMemberProfileUrl: pendingChat.otherMemberProfileUrl || defaultProfileIcon,
      projectTitle: pendingChat.projectTitle || '프로젝트',
      lastMessage: '대화를 시작해보세요.',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      isBlockedByMe: false,
      myApplicationStatus: null,
      myApplicationPosition: null,
    };
    displayedChatRooms.unshift(pendingRoom);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-pretendard">
        <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
      </div>
    );
  }

  if (error && chatRooms.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-pretendard">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadChatRooms()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 font-pretendard">
      {/* Chat Room List */}
      <div
        className={`${showRoomList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 bg-white border-r border-gray-200`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayedChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <User className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600">채팅방이 없습니다</p>
              <p className="text-sm text-gray-500 mt-2">프로젝트에서 채팅을 시작해보세요</p>
            </div>
          ) : (
            displayedChatRooms.map((room) => {
              const isSelectedRoom =
                (selectedRoom?.chatroomId !== null &&
                  selectedRoom?.chatroomId === room.chatroomId) ||
                (pendingChat !== null && room.chatroomId === -1);
              const badge = getStatusBadge(room.myApplicationStatus);
              return (
                <div
                  key={room.chatroomId}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelectedRoom ? 'bg-blue-50' : ''
                  }`}
                  onMouseEnter={() => room.chatroomId !== -1 && setHoverRoomId(room.chatroomId)}
                  onMouseLeave={() => room.chatroomId !== -1 && setHoverRoomId(null)}
                  onClick={() => room.chatroomId !== -1 && handleRoomSelect(room)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={room?.otherMemberProfileUrl || defaultProfileIcon}
                          alt={room?.otherMemberName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{room.unreadCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 h-7">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {room.otherMemberName}
                        </h3>

                        {(isSelectedRoom ||
                          (hoverRoomId !== null && hoverRoomId === room.chatroomId) ||
                          (shownMenuRoomId !== null && shownMenuRoomId === room.chatroomId)) &&
                        room.chatroomId !== -1 ? (
                          <div
                            ref={(el) => void (menuRefs.current[room.chatroomId] = el)}
                            className="flex"
                          >
                            <button
                              className="p-1 hover:bg-gray-100 rounded-lg relative"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                                setShownMenuRoomId(room.chatroomId);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              {showMenu && shownMenuRoomId === room.chatroomId && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProfile(room.otherMemberId);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                  >
                                    프로필 보기
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      room.isBlockedByMe
                                        ? handleUnblockUser(room.chatroomId)
                                        : handleBlockUser(room.chatroomId);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                  >
                                    {room.isBlockedByMe ? '차단 해제' : '차단하기'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLeaveRoom(room.chatroomId);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                                  >
                                    채팅방 나가기
                                  </button>
                                </div>
                              )}
                            </button>
                          </div>
                        ) : (
                          room.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatTime(room.lastMessageAt)}
                            </span>
                          )
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-1 truncate">{room.projectTitle}</p>

                      {badge && room.myApplicationPosition && (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${badge.color}`}
                        >
                          {badge.text} · {room.myApplicationPosition}
                        </span>
                      )}

                      <div className="flex">
                        <p className="flex-1 text-sm text-gray-500 truncate">
                          {room.lastMessage || '대화를 시작해보세요.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        className={`${!showRoomList || !isMobileView ? 'flex' : 'hidden'} md:flex flex-col flex-1`}
      >
        {displayInfo ? (
          <>
            {/* Chat Header */}
            {isMobileView && (
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        pendingChat?.otherMemberProfileUrl ||
                        selectedRoom?.otherMemberProfileUrl ||
                        defaultProfileIcon
                      }
                      alt={pendingChat?.otherMemberName || selectedRoom?.otherMemberName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {pendingChat?.otherMemberName || selectedRoom?.otherMemberName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {pendingChat?.projectTitle || selectedRoom?.projectTitle}
                    </p>
                  </div>
                </div>

                {selectedRoom && (
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg relative"
                  >
                    <MoreVertical className="w-5 h-5" />
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => handleViewProfile(selectedRoom.otherMemberId)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          프로필 보기
                        </button>
                        <button
                          onClick={() =>
                            selectedRoom.isBlockedByMe
                              ? handleUnblockUser(selectedRoom.chatroomId)
                              : handleBlockUser(selectedRoom.chatroomId)
                          }
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          {selectedRoom.isBlockedByMe ? '차단 해제' : '차단하기'}
                        </button>
                        <button
                          onClick={() => handleLeaveRoom(selectedRoom.chatroomId)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                        >
                          채팅방 나가기
                        </button>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* 프로젝트 정보 섹션 - Chat Header 바로 다음에 추가 */}
            {projectInfo && (selectedRoom || pendingChat) && (
              <div
                onClick={() => navigate(`/project-post/${projectInfo.projectId}`)}
                className="p-3 bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={projectInfo.thumbnailUrl || '/placeholder-project.png'}
                    alt={projectInfo.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {projectInfo.title}
                    </p>
                    <p className="text-xs text-gray-500">프로젝트 상세보기 →</p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-moas-gray-5">첫 메시지를 보내 대화를 시작하세요.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMyMessage = msg.senderId === getCurrentUserId();
                  const showDate =
                    idx === 0 ||
                    formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt);

                  return (
                    <div key={msg.messageId}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-moas-gray-2 rounded-full text-xs text-moas-gray-6">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                      >
                        {!isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={msg.senderProfileUrl || defaultProfileIcon}
                              alt={msg.senderName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[70%]`}
                        >
                          {!isMyMessage && (
                            <span className="text-xs text-moas-gray-6 mb-1 ml-1">
                              {msg.senderName}
                            </span>
                          )}

                          {msg.content && (
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isMyMessage
                                  ? isArtist
                                    ? 'bg-moas-artist text-moas-white'
                                    : 'bg-moas-leader text-moas-white'
                                  : 'bg-moas-gray-2 text-moas-gray-9'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                {msg.content}
                              </p>
                            </div>
                          )}

                          {msg.files && msg.files.length > 0 && (
                            <div className="space-y-2 mt-1">
                              {msg.files.map((file) => (
                                <div
                                  key={file.fileId}
                                  className={`rounded-lg overflow-hidden ${
                                    isMyMessage ? 'bg-blue-100' : 'bg-gray-200'
                                  }`}
                                >
                                  {file.fileType.startsWith('image/') ? (
                                    <img
                                      src={file.fileUrl}
                                      alt={file.originalFileName}
                                      className="max-w-full h-auto cursor-pointer hover:opacity-90"
                                    />
                                  ) : (
                                    <div className="p-3 flex items-center gap-3">
                                      <FileText className="w-8 h-8 text-gray-600" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {file.originalFileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(file.fileSize)}
                                        </p>
                                      </div>
                                      <a
                                        href={file.fileUrl}
                                        download={file.originalFileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <span className="text-xs text-gray-500 mt-1 mx-1 flex items-center gap-1">
                            {formatTime(msg.createdAt)}
                            {isMyMessage && !msg.isRead && (
                              <span className="text-xs font-semibold text-yellow-600">1</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {!canSendMessage && selectedRoom && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">메시지를 보낼 수 없습니다.</p>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700 max-w-[150px] truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="p-0.5 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-stretch gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.zip"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedRoom ? !canSendMessage : false}
                  className="flex items-center justify-center w-12 hover:bg-gray-100 rounded-lg transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 relative flex items-center">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={selectedRoom ? !canSendMessage : false}
                    placeholder="메시지를 입력하세요..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                  <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </span>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={
                    (!inputMessage.trim() && selectedFiles.length === 0) ||
                    (selectedRoom && !canSendMessage) ||
                    sending
                  }
                  className="flex items-center justify-center w-12 bg-primary-yellow text-white rounded-lg hover:bg-amber-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shift + Enter로 줄바꿈 • 최대 10개 파일, 100MB까지 첨부 가능
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">채팅방을 선택해주세요</h3>
              <p className="text-gray-600">왼쪽 목록에서 채팅방을 선택하여 대화를 시작하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
