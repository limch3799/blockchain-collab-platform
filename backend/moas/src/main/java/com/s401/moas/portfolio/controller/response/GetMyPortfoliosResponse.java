package com.s401.moas.portfolio.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.portfolio.service.dto.PortfolioListDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 내 포트폴리오 목록 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetMyPortfoliosResponse {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioItem {
        private Long portfolioId;
        private Integer positionId;
        private String positionName;
        private String title;
        private String thumbnailImageUrl;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime createdAt;

        public static PortfolioItem from(PortfolioListDto dto) {
            return PortfolioItem.builder()
                    .portfolioId(dto.getPortfolioId())
                    .positionId(dto.getPositionId())
                    .positionName(dto.getPositionName())
                    .title(dto.getTitle())
                    .thumbnailImageUrl(dto.getThumbnailImageUrl())
                    .createdAt(dto.getCreatedAt())
                    .build();
        }
    }

    private List<PortfolioItem> data;

    public static GetMyPortfoliosResponse from(List<PortfolioListDto> dtoList) {
        List<PortfolioItem> items = dtoList.stream()
                .map(PortfolioItem::from)
                .collect(Collectors.toList());

        return GetMyPortfoliosResponse.builder()
                .data(items)
                .build();
    }
}