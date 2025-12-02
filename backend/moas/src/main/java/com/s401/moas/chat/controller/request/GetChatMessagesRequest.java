package com.s401.moas.chat.controller.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "채팅방 메시지 조회 요청")
public class GetChatMessagesRequest {

    @Schema(description = "커서 기준 메시지 ID (이 ID보다 이전 메시지 조회)", example = "1005", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private Long lastMessageId;

    @Min(1)
    @Max(100)
    @Schema(description = "조회할 메시지 개수", example = "20", defaultValue = "20", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private Integer size = 20;
}