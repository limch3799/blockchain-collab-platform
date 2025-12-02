// src/store/chatUnreadStore.ts
import { create } from 'zustand';
import apiClient from '@/api/axios';

interface ChatUnreadStore {
  hasUnread: boolean;
  setHasUnread: (hasUnread: boolean) => void;
  checkUnreadMessages: () => Promise<void>;
  markAsViewed: () => void;
}

export const useChatUnreadStore = create<ChatUnreadStore>((set) => ({
  hasUnread: false,

  setHasUnread: (hasUnread: boolean) => {
    set({ hasUnread });
  },

  // Check if there are any unread messages (called on login/page load)
  checkUnreadMessages: async () => {
    try {
      const response = await apiClient.get('/chat/rooms');
      const rooms = response.data.data;

      // Check if any room has unread messages
      const hasAnyUnread = rooms.some((room: any) => room.unreadCount > 0);
      set({ hasUnread: hasAnyUnread });
    } catch (error) {
      console.error('Failed to check unread messages:', error);
    }
  },

  // Mark as viewed when user opens chat page
  markAsViewed: () => {
    set({ hasUnread: false });
  },
}));
