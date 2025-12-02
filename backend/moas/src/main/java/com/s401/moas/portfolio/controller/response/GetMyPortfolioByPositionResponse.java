package com.s401.moas.portfolio.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.portfolio.service.dto.PortfolioListDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 특정 포지션의 내 포트폴리오 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetMyPortfolioByPositionResponse {
    private Long portfolioId;
    private Integer positionId;
    private String positionName;
    private String title;
    private String thumbnailImageUrl;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime createdAt;

    /**
     * DTO를 Response로 변환
     */
    public static GetMyPortfolioByPositionResponse from(PortfolioListDto dto) {
        return GetMyPortfolioByPositionResponse.builder()
                .portfolioId(dto.getPortfolioId())
                .positionId(dto.getPositionId())
                .positionName(dto.getPositionName())
                .title(dto.getTitle())
                .thumbnailImageUrl(dto.getThumbnailImageUrl())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}