package com.s401.moas.application.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.portfolio.service.dto.PortfolioDetailDto;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicantDetailResponse {
    // Application & Contract 정보
    private Long applicationId;
    private String applicationStatus;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private String message;
    private Long contractId;
    private String contractStatus;

    // Applicant(Member & Review) 정보 (목록 DTO 재사용)
    private ApplicantListResponse.ApplicantInfo applicant;

    // Position 정보 (목록 DTO 재사용)
    private ApplicantListResponse.PositionInfo position;

    // Portfolio 상세 정보
    private PortfolioDetail portfolio;

    @Getter
    @Builder
    public static class PortfolioDetail {
        private Long portfolioId;
        private Integer positionId;
        private String positionName;
        private Integer categoryId;
        private String categoryName;
        private String title;
        private String description;
        private String thumbnailImageUrl;
        private List<ImageItem> images; // 타입을 ImageItem으로 변경
        private List<FileItem> files;

        // PortfolioDetailDto를 이 Response DTO로 변환하는 정적 팩토리 메서드
        public static PortfolioDetail from(PortfolioDetailDto dto) {
            List<ImageItem> imageItems = dto.getImages().stream()
                    .map(ImageItem::from)
                    .collect(Collectors.toList());

            List<FileItem> fileItems = dto.getFiles().stream()
                    .map(FileItem::from)
                    .collect(Collectors.toList());

            return PortfolioDetail.builder()
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
                    .build();
        }
    }

    @Getter
    @Builder
    public static class ImageItem {
        private Long imageId;
        private String imageUrl;
        private String originalImageUrl;
        private Integer imageOrder;

        public static ImageItem from(PortfolioDetailDto.ImageDto dto) {
            return ImageItem.builder()
                    .imageId(dto.getImageId())
                    .imageUrl(dto.getImageUrl())
                    .originalImageUrl(dto.getOriginalImageUrl())
                    .imageOrder(dto.getImageOrder() != null ? dto.getImageOrder().intValue() : 0)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class FileItem {
        private Long fileId;
        private String originalFileName;
        private String storedFileUrl;

        public static FileItem from(PortfolioDetailDto.FileDto dto) {
            return FileItem.builder()
                    .fileId(dto.getFileId())
                    .originalFileName(dto.getOriginalFileName())
                    .storedFileUrl(dto.getStoredFileUrl())
                    .build();
        }
    }
}