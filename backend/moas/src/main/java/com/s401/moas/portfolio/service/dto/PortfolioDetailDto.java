package com.s401.moas.portfolio.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 포트폴리오 상세 조회 서비스 계층 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDetailDto {
    private Long portfolioId;
    private Integer positionId;
    private String positionName;
    private Integer categoryId;
    private String categoryName;
    private String title;
    private String description;
    private String thumbnailImageUrl;
    private List<ImageDto> images;
    private List<FileDto> files;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDto {
        private Long imageId;
        private String imageUrl;           // 압축 이미지 URL
        private String originalImageUrl;   // 원본 이미지 URL
        private Byte imageOrder;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileDto {
        private Long fileId;
        private String originalFileName;
        private String storedFileUrl;
        private String fileType;
        private Integer fileSize;
    }
}