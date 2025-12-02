package com.s401.moas.chat.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateChatroomRequest {

    @NotNull(message = "projectId must not be null.")
    private Integer projectId;

    @NotNull(message = "otherMemberId must not be null.")
    private Integer otherMemberId;
}