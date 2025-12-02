package com.s401.moas.notification.controller.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "알림 목록 조회 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GetNotificationsRequest {

    @Schema(description = "페이지 번호 (0부터 시작)", example = "0", defaultValue = "0")
    @Min(0)
    private Integer page = 0;

    @Schema(description = "페이지 크기", example = "20", defaultValue = "20")
    @Min(1)
    @Max(100)
    private Integer size = 20;
}