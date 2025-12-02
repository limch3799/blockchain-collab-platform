package com.s401.moas.chat.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.chat.service.dto.GetChatMessagesDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@Schema(description = "채팅방 메시지 조회 응답")
public class GetChatMessagesResponse {

    @Schema(description = "응답 메시지", example = "채팅방 메시지 조회를 성공했습니다.")
    private final String message;

    @Schema(description = "채팅방 메시지 데이터")
    private final ChatMessagesData data;

    public static GetChatMessagesResponse from(GetChatMessagesDto dto, String message) {
        return GetChatMessagesResponse.builder()
                .message(message)
                .data(ChatMessagesData.builder()
                        .chatroomId(dto.getChatroomId())
                        .projectId(dto.getProjectId())
                        .projectTitle(dto.getProjectTitle())
                        .otherMemberId(dto.getOtherMemberId())
                        .otherMemberName(dto.getOtherMemberName())
                        .otherMemberProfileUrl(dto.getOtherMemberProfileUrl())
                        .isBlockedByMe(dto.getIsBlockedByMe())
                        .isBlockedByOther(dto.getIsBlockedByOther())
                        .myLeftAt(dto.getMyLeftAt())
                        .canSendMessage(dto.getCanSendMessage())
                        .myLastReadMessageId(dto.getMyLastReadMessageId())
                        .otherLastReadMessageId(dto.getOtherLastReadMessageId())
                        .messages(dto.getMessages().stream()
                                .map(MessageItem::from)
                                .toList())
                        .hasNext(dto.getHasNext())
                        .build())
                .build();
    }

    @Getter
    @Builder
    @Schema(description = "채팅방 메시지 데이터")
    public static class ChatMessagesData {
        @Schema(description = "채팅방 ID", example = "456")
        private final Long chatroomId;

        @Schema(description = "프로젝트 ID", example = "123")
        private final Integer projectId;

        @Schema(description = "프로젝트 제목", example = "알파 프로젝트")
        private final String projectTitle;

        @Schema(description = "상대방 회원 ID", example = "789")
        private final Integer otherMemberId;

        @Schema(description = "상대방 이름", example = "홍길동")
        private final String otherMemberName;

        @Schema(description = "상대방 프로필 이미지 URL")
        private final String otherMemberProfileUrl;

        @Schema(description = "내가 상대방을 차단했는지 여부", example = "false")
        private final Boolean isBlockedByMe;

        @Schema(description = "상대방이 나를 차단했는지 여부", example = "false")
        private final Boolean isBlockedByOther;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "내가 퇴장한 시간 (null이면 퇴장하지 않음)")
        private final LocalDateTime myLeftAt;

        @Schema(description = "메시지 전송 가능 여부", example = "true")
        private final Boolean canSendMessage;

        @Schema(description = "내가 마지막으로 읽은 메시지 ID", example = "1005")
        private final Long myLastReadMessageId;

        @Schema(description = "상대방이 마지막으로 읽은 메시지 ID", example = "1003")
        private final Long otherLastReadMessageId;

        @Schema(description = "메시지 목록")
        private final List<MessageItem> messages;

        @Schema(description = "다음 페이지 존재 여부", example = "true")
        private final Boolean hasNext;
    }

    @Getter
    @Builder
    @Schema(description = "메시지 아이템")
    public static class MessageItem {
        @Schema(description = "메시지 ID", example = "1005")
        private final Long messageId;

        @Schema(description = "발신자 회원 ID", example = "100")
        private final Integer senderId;

        @Schema(description = "발신자 이름", example = "김철수")
        private final String senderName;

        @Schema(description = "발신자 프로필 이미지 URL")
        private final String senderProfileUrl;

        @Schema(description = "메시지 내용", example = "안녕하세요")
        private final String content;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "메시지 전송 시간", example = "2024-11-15T15:20:00")
        private final LocalDateTime createdAt;

        @Schema(description = "첨부 파일 목록")
        private final List<FileItem> files;

        public static MessageItem from(GetChatMessagesDto.MessageDto dto) {
            return MessageItem.builder()
                    .messageId(dto.getMessageId())
                    .senderId(dto.getSenderId())
                    .senderName(dto.getSenderName())
                    .senderProfileUrl(dto.getSenderProfileUrl())
                    .content(dto.getContent())
                    .createdAt(dto.getCreatedAt())
                    .files(dto.getFiles().stream()
                            .map(FileItem::from)
                            .toList())
                    .build();
        }
    }

    @Getter
    @Builder
    @Schema(description = "첨부 파일 아이템")
    public static class FileItem {
        @Schema(description = "파일 ID", example = "502")
        private final Long fileId;

        @Schema(description = "원본 파일명", example = "design-mockup.jpg")
        private final String originalFileName;

        @Schema(description = "파일 URL", example = "https://s3.example.com/chat/files/design-mockup.jpg")
        private final String fileUrl;

        @Schema(description = "파일 타입", example = "image/jpeg")
        private final String fileType;

        @Schema(description = "파일 크기 (bytes)", example = "3145728")
        private final Long fileSize;

        public static FileItem from(GetChatMessagesDto.FileDto dto) {
            return FileItem.builder()
                    .fileId(dto.getFileId())
                    .originalFileName(dto.getOriginalFileName())
                    .fileUrl(dto.getFileUrl())
                    .fileType(dto.getFileType())
                    .fileSize(dto.getFileSize())
                    .build();
        }
    }
}