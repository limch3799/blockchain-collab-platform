package com.s401.moas.chat.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LeaveChatroomDto {
    private Long chatroomId;
    private LocalDateTime leftAt;
}