package com.s401.moas.chat.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class GetChatMessagesDto {
    private final Long chatroomId;
    private final Integer projectId;
    private final String projectTitle;
    private final Integer otherMemberId;
    private final String otherMemberName;
    private final String otherMemberProfileUrl;
    private final Boolean isBlockedByMe;
    private final Boolean isBlockedByOther;
    private final LocalDateTime myLeftAt;
    private final Boolean canSendMessage;
    private final Long myLastReadMessageId;
    private final Long otherLastReadMessageId;
    private final List<MessageDto> messages;
    private final Boolean hasNext;

    @Getter
    @Builder
    public static class MessageDto {
        private final Long messageId;
        private final Integer senderId;
        private final String senderName;
        private final String senderProfileUrl;
        private final String content;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;
        private final List<FileDto> files;
    }

    @Getter
    @Builder
    public static class FileDto {
        private final Long fileId;
        private final String originalFileName;
        private final String fileUrl;
        private final String fileType;
        private final Long fileSize;
    }
}