package com.s401.moas.chat.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.chat.service.dto.ChatroomListDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ChatroomListResponse {
    private final String message;
    private final List<ChatroomItemResponse> data;

    public static ChatroomListResponse from(ChatroomListDto dto, String message) {
        return ChatroomListResponse.builder()
                .message(message)
                .data(dto.getChatrooms().stream()
                        .map(ChatroomItemResponse::from)
                        .toList())
                .build();
    }

    @Getter
    @Builder
    public static class ChatroomItemResponse {
        private final Long chatroomId;
        private final Integer projectId;
        private final String projectTitle;
        private final Integer otherMemberId;
        private final String otherMemberName;
        private final String otherMemberProfileUrl;
        private final String lastMessage;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime lastMessageAt;
        private final Integer unreadCount;
        private final Boolean isBlockedByMe;
        private final String myApplicationStatus;
        private final String myApplicationPosition;

        public static ChatroomItemResponse from(ChatroomListDto.ChatroomItemDto dto) {
            return ChatroomItemResponse.builder()
                    .chatroomId(dto.getChatroomId())
                    .projectId(dto.getProjectId())
                    .projectTitle(dto.getProjectTitle())
                    .otherMemberId(dto.getOtherMemberId())
                    .otherMemberName(dto.getOtherMemberName())
                    .otherMemberProfileUrl(dto.getOtherMemberProfileUrl())
                    .lastMessage(dto.getLastMessage())
                    .lastMessageAt(dto.getLastMessageAt())
                    .unreadCount(dto.getUnreadCount())
                    .isBlockedByMe(dto.getIsBlockedByMe())
                    .myApplicationStatus(dto.getMyApplicationStatus())
                    .myApplicationPosition(dto.getMyApplicationPosition())
                    .build();
        }
    }
}