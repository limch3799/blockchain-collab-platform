package com.s401.moas.chat.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.chat.service.dto.CreateChatroomDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateChatroomResponse {

    private String message;
    private ChatroomData data;

    @Getter
    @Builder
    public static class ChatroomData {
        private Long chatroomId;
        private Integer projectId;
        private String projectTitle;
        private Integer otherMemberId;
        private String otherMemberName;
        private String otherMemberProfileUrl;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }

    public static CreateChatroomResponse from(CreateChatroomDto dto, String message) {
        return CreateChatroomResponse.builder()
                .message(message)
                .data(ChatroomData.builder()
                        .chatroomId(dto.getChatroomId())
                        .projectId(dto.getProjectId())
                        .projectTitle(dto.getProjectTitle())
                        .otherMemberId(dto.getOtherMemberId())
                        .otherMemberName(dto.getOtherMemberName())
                        .otherMemberProfileUrl(dto.getOtherMemberProfileUrl())
                        .createdAt(dto.getCreatedAt())
                        .build())
                .build();
    }
}