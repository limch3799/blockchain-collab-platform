package com.s401.moas.portfolio.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 포트폴리오 서비스 계층 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDto {
    private Long portfolioId;
    private String title;
    private String thumbnailImageUrl;
    private Integer imageCount;
    private Integer fileCount;
    private LocalDateTime createdAt;
}
