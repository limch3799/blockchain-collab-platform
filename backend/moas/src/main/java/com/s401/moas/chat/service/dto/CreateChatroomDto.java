package com.s401.moas.chat.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CreateChatroomDto {

    private Long chatroomId;
    private Integer projectId;
    private String projectTitle;
    private Integer otherMemberId;
    private String otherMemberName;
    private String otherMemberProfileUrl;
    private LocalDateTime createdAt;
    private boolean isNewRoom; // 201 vs 200 구분용
}