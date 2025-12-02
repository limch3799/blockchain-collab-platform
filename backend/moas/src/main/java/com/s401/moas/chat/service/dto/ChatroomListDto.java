package com.s401.moas.chat.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ChatroomListDto {
    private final List<ChatroomItemDto> chatrooms;

    @Getter
    @Builder
    public static class ChatroomItemDto {
        private final Long chatroomId;
        private final Integer projectId;
        private final String projectTitle;
        private final Integer otherMemberId;
        private final String otherMemberName;
        private final String otherMemberProfileUrl;
        private final String lastMessage;
        private final LocalDateTime lastMessageAt;
        private final Integer unreadCount;
        private final Boolean isBlockedByMe;
        private final String myApplicationStatus;
        private final String myApplicationPosition;
    }
}