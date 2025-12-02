package com.s401.moas.chat.controller.response;

import com.s401.moas.chat.service.dto.BlockChatMemberDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BlockChatMemberResponse {

    private String message;
    private Data data;

    @Getter
    @Builder
    public static class Data {
        private Long chatroomId;
        private Boolean isBlocked;
    }

    public static BlockChatMemberResponse from(BlockChatMemberDto dto, String message) {
        return BlockChatMemberResponse.builder()
                .message(message)
                .data(Data.builder()
                        .chatroomId(dto.getChatroomId())
                        .isBlocked(dto.getIsBlocked())
                        .build())
                .build();
    }
}