package com.s401.moas.portfolio.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.portfolio.service.dto.PortfolioDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 포트폴리오 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePortfolioResponse {
    private Long portfolioId;
    private String title;
    private String thumbnailImageUrl;
    private Integer imageCount;
    private Integer fileCount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * PortfolioDto를 PortfolioResponse로 변환
     */
    public static CreatePortfolioResponse from(PortfolioDto dto) {
        return CreatePortfolioResponse.builder()
                .portfolioId(dto.getPortfolioId())
                .title(dto.getTitle())
                .thumbnailImageUrl(dto.getThumbnailImageUrl())
                .imageCount(dto.getImageCount())
                .fileCount(dto.getFileCount())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
