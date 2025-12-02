package com.s401.moas.portfolio.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 포트폴리오 목록 조회 서비스 계층 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioListDto {
    private Long portfolioId;
    private Integer positionId;
    private String positionName;
    private String title;
    private String thumbnailImageUrl;
    private LocalDateTime createdAt;
}