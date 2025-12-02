package com.s401.moas.chat.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.chat.service.dto.LeaveChatroomDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LeaveChatroomResponse {

    private String message;
    private Data data;

    @Getter
    @Builder
    public static class Data {
        private Long chatroomId;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime leftAt;
    }

    public static LeaveChatroomResponse from(LeaveChatroomDto dto, String message) {
        return LeaveChatroomResponse.builder()
                .message(message)
                .data(Data.builder()
                        .chatroomId(dto.getChatroomId())
                        .leftAt(dto.getLeftAt())
                        .build())
                .build();
    }
}