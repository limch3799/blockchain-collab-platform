package com.s401.moas.chat.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BlockChatMemberDto {
    private Long chatroomId;
    private Boolean isBlocked;
}