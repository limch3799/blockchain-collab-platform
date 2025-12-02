package com.s401.moas.portfolio.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.portfolio.service.dto.PortfolioDetailDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 포트폴리오 상세 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetPortfolioDetailResponse {
    private Long portfolioId;
    private Integer positionId;
    private String positionName;
    private Integer categoryId;
    private String categoryName;
    private String title;
    private String description;
    private String thumbnailImageUrl;
    private List<ImageItem> images;
    private List<FileItem> files;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageItem {
        private Long imageId;
        private String imageUrl;
        private String originalImageUrl;
        private Integer imageOrder;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileItem {
        private Long fileId;
        private String originalFileName;
        private String storedFileUrl;
        private String fileType;
        private Integer fileSize;
    }

    /**
     * DTO를 Response로 변환
     */
    public static GetPortfolioDetailResponse from(PortfolioDetailDto dto) {
        List<ImageItem> imageItems = dto.getImages().stream()
                .map(img -> ImageItem.builder()
                        .imageId(img.getImageId())
                        .imageUrl(img.getImageUrl())
                        .originalImageUrl(img.getOriginalImageUrl())
                        .imageOrder(img.getImageOrder().intValue())
                        .build())
                .collect(Collectors.toList());

        List<FileItem> fileItems = dto.getFiles().stream()
                .map(file -> FileItem.builder()
                        .fileId(file.getFileId())
                        .originalFileName(file.getOriginalFileName())
                        .storedFileUrl(file.getStoredFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .build())
                .collect(Collectors.toList());

        return GetPortfolioDetailResponse.builder()
                .portfolioId(dto.getPortfolioId())
                .positionId(dto.getPositionId())
                .positionName(dto.getPositionName())
                .categoryId(dto.getCategoryId())
                .categoryName(dto.getCategoryName())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .thumbnailImageUrl(dto.getThumbnailImageUrl())
                .images(imageItems)
                .files(fileItems)
                .createdAt(dto.getCreatedAt())
                .build();
    }
}