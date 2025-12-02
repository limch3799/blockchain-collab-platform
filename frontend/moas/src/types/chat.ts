export interface FileAttachment {
  fileId: number;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  messageId: number;
  senderId: number;
  senderName: string;
  senderProfileUrl: string;
  content: string;
  createdAt: string;
  files: FileAttachment[];
  isRead?: boolean;
}

export interface ChatRoom {
  chatroomId: number;
  projectId: number;
  projectTitle: string;
  otherMemberId: number;
  otherMemberName: string;
  otherMemberProfileUrl: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isBlockedByMe: boolean;
  myApplicationStatus: 'OFFERED' | 'PENDING' | 'REJECTED' | null;
  myApplicationPosition: string | null;
}

export interface StatusBadge {
  text: string;
  color: string;
}

export interface ChatRoomResponse {
  message: string;
  data: ChatRoom[];
}

export interface ChatMessagesResponse {
  message: string;
  data: {
    chatroomId: number;
    projectId: number;
    projectTitle: string;
    otherMemberId: number;
    otherMemberName: string;
    otherMemberProfileUrl: string | null;
    isBlockedByMe: boolean;
    isBlockedByOther: boolean;
    myLeftAt: string | null;
    canSendMessage: boolean;
    myLastReadMessageId: number;
    otherLastReadMessageId: number;
    messages: Message[];
    hasNext: boolean;
  };
}

export interface CreateChatRoomResponse {
  message: string;
  data: {
    chatroomId: number;
    projectId: number;
    projectTitle: string;
    otherMemberId: number;
    otherMemberName: string;
    otherMemberProfileUrl: string;
    createdAt: string;
  };
}
