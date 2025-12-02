package com.s401.moas.portfolio.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 포트폴리오 수정 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePortfolioResponse {
    private Long portfolioId;           // 새로 생성된 포트폴리오 ID
    private String title;
    private String thumbnailImageUrl;
    private Integer imageCount;
    private Integer fileCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;    // 수정본 생성 시각
}