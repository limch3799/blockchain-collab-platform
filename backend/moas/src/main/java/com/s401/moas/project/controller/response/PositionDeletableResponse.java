package com.s401.moas.project.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 포지션 삭제 가능 여부 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDeletableResponse {
    /**
     * 삭제 가능 여부
     */
    private Boolean deletable;

    /**
     * 삭제 불가능한 경우 이유 메시지 (선택적)
     */
    private String message;
}
