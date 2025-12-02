package com.s401.moas.portfolio.service;

import com.s401.moas.global.exception.ResourceNotFoundException;
import com.s401.moas.portfolio.controller.request.CreatePortfolioRequest;
import com.s401.moas.portfolio.controller.request.UpdatePortfolioRequest;
import com.s401.moas.portfolio.service.dto.PortfolioDetailDto;
import com.s401.moas.portfolio.service.dto.PortfolioDto;
import com.s401.moas.portfolio.domain.Portfolio;
import com.s401.moas.portfolio.domain.PortfolioFile;
import com.s401.moas.portfolio.domain.PortfolioImage;
import com.s401.moas.global.exception.InvalidFileFormatException;
import com.s401.moas.global.util.FileValidator;
import com.s401.moas.portfolio.exception.PortfolioException;
import com.s401.moas.portfolio.repository.PortfolioFileRepository;
import com.s401.moas.portfolio.repository.PortfolioImageRepository;
import com.s401.moas.portfolio.repository.PortfolioRepository;
import com.s401.moas.global.service.ImageService;
import com.s401.moas.global.service.ImageService.ImageUploadResult;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.portfolio.service.dto.PortfolioListDto;
import com.s401.moas.project.domain.Position;
import com.s401.moas.project.repository.PositionRepository;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.s401.moas.project.domain.Category;
import com.s401.moas.project.repository.CategoryRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioImageRepository portfolioImageRepository;
    private final PortfolioFileRepository portfolioFileRepository;
    private final ImageService imageService;
    private final S3Service s3Service;
    private final PositionRepository positionRepository;
    private final CategoryRepository categoryRepository;

    @Value("${portfolio.file.max-images}")
    private int maxImages;

    @Value("${portfolio.file.max-image-size}")
    private long maxImageSize;

    @Value("${portfolio.file.max-total-file-size}")
    private long maxTotalFileSize;

    @Value("${portfolio.file.allowed-image-types}")
    private String allowedImageTypes;

    /**
     * 포트폴리오 생성
     */
    @Transactional
    public PortfolioDto createPortfolio(CreatePortfolioRequest request, Integer memberId) {
        // 1. 유효성 검증
        validateRequest(request);

        // 2. 동일 포지션 포트폴리오 중복 체크
        if (portfolioRepository.existsByMemberIdAndPositionIdAndDeletedAtIsNull(memberId, request.getPositionId())) {
            throw PortfolioException.portfolioAlreadyExistsForPosition(request.getPositionId());
        }

        try {
            // 3. 포트폴리오 엔티티 생성 및 저장
            Portfolio portfolio = Portfolio.builder()
                    .memberId(memberId)
                    .positionId(request.getPositionId())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .createdAt(LocalDateTime.now())
                    .build();

            Portfolio savedPortfolio = portfolioRepository.save(portfolio);

            // 4. 썸네일 업로드
            String thumbnailUrl = uploadThumbnail(request.getThumbnailImage());
            savedPortfolio = Portfolio.builder()
                    .id(savedPortfolio.getId())
                    .memberId(savedPortfolio.getMemberId())
                    .positionId(savedPortfolio.getPositionId())
                    .title(savedPortfolio.getTitle())
                    .description(savedPortfolio.getDescription())
                    .thumbnailImageUrl(thumbnailUrl)
                    .createdAt(savedPortfolio.getCreatedAt())
                    .build();
            portfolioRepository.save(savedPortfolio);

            // 5. 이미지들 업로드 (있는 경우)
            int imageCount = 0;
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                imageCount = uploadImages(savedPortfolio.getId(), request.getImages());
            }

            // 6. 첨부파일들 업로드 (있는 경우)
            int fileCount = 0;
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                fileCount = uploadFiles(savedPortfolio.getId(), request.getFiles());
            }

            // 7. DTO 변환 및 반환
            return PortfolioDto.builder()
                    .portfolioId(savedPortfolio.getId())
                    .title(savedPortfolio.getTitle())
                    .thumbnailImageUrl(thumbnailUrl)
                    .imageCount(imageCount)
                    .fileCount(fileCount)
                    .createdAt(savedPortfolio.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생", e);
            throw PortfolioException.s3UploadFailed(e);
        }
    }

    /**
     * 포트폴리오 삭제 (Soft Delete)
     * @param portfolioId 삭제할 포트폴리오 ID
     * @param memberId 요청한 회원 ID
     * @return 삭제 시각
     */
    @Transactional
    public LocalDateTime deletePortfolio(Long portfolioId, Integer memberId) {
        // 1. 포트폴리오 조회
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> PortfolioException.portfolioNotFound());

        // 2. 소유자 확인
        if (!portfolio.getMemberId().equals(memberId)) {
            throw PortfolioException.portfolioAccessDenied();
        }

        // 3. 이미 삭제된 포트폴리오인지 확인
        if (portfolio.getDeletedAt() != null) {
            throw PortfolioException.portfolioAlreadyDeleted();
        }

        // 4. Soft Delete: deleted_at 업데이트
        LocalDateTime deletedAt = LocalDateTime.now();
        Portfolio deletedPortfolio = Portfolio.builder()
                .id(portfolio.getId())
                .memberId(portfolio.getMemberId())
                .positionId(portfolio.getPositionId())
                .title(portfolio.getTitle())
                .description(portfolio.getDescription())
                .thumbnailImageUrl(portfolio.getThumbnailImageUrl())
                .createdAt(portfolio.getCreatedAt())
                .deletedAt(deletedAt)
                .build();

        portfolioRepository.save(deletedPortfolio);

        log.info("포트폴리오 삭제 완료 - ID: {}, deletedAt: {}", portfolioId, deletedAt);

        return deletedAt;
    }

    /**
     * 요청 유효성 검증
     */
    private void validateRequest(CreatePortfolioRequest request) {
        // 1. 썸네일 단일 파일 검증 (크기 + 타입)
        FileValidator.validateFile(request.getThumbnailImage(), maxImageSize);
        validateImageType(request.getThumbnailImage());

        // 2. 이미지 목록이 있는 경우
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // 2-1. 이미지 개수 검증
            if (request.getImages().size() > maxImages) {
                throw new IllegalArgumentException("이미지는 최대 " + maxImages + "개까지 업로드 가능합니다.");
            }

            // 2-2. 각 이미지의 크기 + 타입 검증
            for (MultipartFile image : request.getImages()) {
                FileValidator.validateFile(image, maxImageSize);
                validateImageType(image);
            }
        }

        // 3. 첨부파일 총 용량 검증
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            long totalFileSize = request.getFiles().stream()
                    .mapToLong(MultipartFile::getSize)
                    .sum();

            if (totalFileSize > maxTotalFileSize) {
                throw new IllegalArgumentException(
                        String.format("첨부파일 총 용량이 제한을 초과했습니다. (현재: %d bytes, 최대: %d bytes)",
                                totalFileSize, maxTotalFileSize)
                );
            }
        }
    }

    /**
     * 이미지 타입 검증 (별도 메서드)
     */
    private void validateImageType(MultipartFile file) {
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(allowedImageTypes.split(","));

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new InvalidFileFormatException(contentType);
        }
    }

    /**
     * 썸네일 업로드
     */
    private String uploadThumbnail(MultipartFile thumbnailImage) throws IOException {
        return s3Service.upload(thumbnailImage, "portfolio/thumbnails");
    }

    /**
     * 이미지들 업로드
     */
    private int uploadImages(Long portfolioId, List<MultipartFile> images) throws IOException {
        byte order = 0;
        for (MultipartFile image : images) {
            ImageUploadResult result = imageService.uploadWithCompression(image, "portfolio/images");

            // 1. 원본 이미지 저장
            PortfolioImage originalImage = PortfolioImage.builder()
                    .portfolioId(portfolioId)
                    .imageUrl(result.originalUrl())  // 원본 URL
                    .imageOrder(order)
                    .imageSize((int) image.getSize())  // 원본 크기
                    .uploadedAt(LocalDateTime.now())
                    .build();

            PortfolioImage savedOriginal = portfolioImageRepository.save(originalImage);
            Long originalId = savedOriginal.getId();  // 원본 이미지 ID 추출

            // 2. 압축 이미지 저장 (원본 ID 참조)
            PortfolioImage compressedImage = PortfolioImage.builder()
                    .portfolioId(portfolioId)
                    .originalImageId(originalId)  // 원본 이미지 ID 참조
                    .imageUrl(result.compressedUrl())  // 압축 URL
                    .imageOrder(order++)
                    .imageSize((int)result.compressedSize())  // 압축된 크기
                    .uploadedAt(LocalDateTime.now())
                    .build();

            portfolioImageRepository.save(compressedImage);
        }
        return images.size();
    }

    /**
     * 첨부파일들 업로드
     */
    private int uploadFiles(Long portfolioId, List<MultipartFile> files) throws IOException {
        for (MultipartFile file : files) {
            String fileUrl = s3Service.upload(file, "portfolio/files");

            PortfolioFile portfolioFile = PortfolioFile.builder()
                    .portfolioId(portfolioId)
                    .originalFileName(file.getOriginalFilename())
                    .storedFileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .fileSize((int) file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            portfolioFileRepository.save(portfolioFile);
        }
        return files.size();
    }

    /**
     * 포트폴리오 수정
     * 기존 포트폴리오를 soft delete하고 수정된 내용으로 새 포트폴리오 생성
     */
    @Transactional
    public PortfolioDto updatePortfolio(Long portfolioId, UpdatePortfolioRequest request, Integer memberId) {
        try {
            // 1. 기존 포트폴리오 조회 및 검증
            Portfolio existingPortfolio = portfolioRepository.findById(portfolioId)
                    .orElseThrow(() -> PortfolioException.portfolioNotFound());

            // 2. 소유자 확인
            if (!existingPortfolio.getMemberId().equals(memberId)) {
                throw PortfolioException.portfolioAccessDenied();
            }

            // 3. 이미 삭제된 포트폴리오인지 확인
            if (existingPortfolio.getDeletedAt() != null) {
                throw PortfolioException.portfolioAlreadyDeleted();
            }

            // 4. 기존 포트폴리오 soft delete
            Portfolio deletedPortfolio = Portfolio.builder()
                    .id(existingPortfolio.getId())
                    .memberId(existingPortfolio.getMemberId())
                    .positionId(existingPortfolio.getPositionId())
                    .title(existingPortfolio.getTitle())
                    .description(existingPortfolio.getDescription())
                    .thumbnailImageUrl(existingPortfolio.getThumbnailImageUrl())
                    .createdAt(existingPortfolio.getCreatedAt())
                    .deletedAt(LocalDateTime.now())
                    .build();
            portfolioRepository.save(deletedPortfolio);

            // 5. 새 포트폴리오 엔티티 생성
            Portfolio newPortfolio = Portfolio.builder()
                    .memberId(memberId)
                    .positionId(request.getPositionId())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .createdAt(LocalDateTime.now())
                    .build();

            Portfolio savedPortfolio = portfolioRepository.save(newPortfolio);

            // 6. 썸네일 처리
            String thumbnailUrl = processThumbnail(request);
            savedPortfolio = Portfolio.builder()
                    .id(savedPortfolio.getId())
                    .memberId(savedPortfolio.getMemberId())
                    .positionId(savedPortfolio.getPositionId())
                    .title(savedPortfolio.getTitle())
                    .description(savedPortfolio.getDescription())
                    .thumbnailImageUrl(thumbnailUrl)
                    .createdAt(savedPortfolio.getCreatedAt())
                    .build();
            portfolioRepository.save(savedPortfolio);

            // 7. 이미지 처리
            int imageCount = processImages(savedPortfolio.getId(), request);

            // 8. 파일 처리
            int fileCount = processFiles(savedPortfolio.getId(), request);

            // 9. DTO 변환 및 반환
            return PortfolioDto.builder()
                    .portfolioId(savedPortfolio.getId())
                    .title(savedPortfolio.getTitle())
                    .thumbnailImageUrl(thumbnailUrl)
                    .imageCount(imageCount)
                    .fileCount(fileCount)
                    .createdAt(savedPortfolio.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("포트폴리오 수정 중 파일 업로드 오류 발생", e);
            throw PortfolioException.s3UploadFailed(e);
        }
    }

    /**
     * 썸네일 처리
     */
    private String processThumbnail(UpdatePortfolioRequest request) throws IOException {
        if (request.getThumbnailImage() != null && !request.getThumbnailImage().isEmpty()) {
            // 새 썸네일 업로드 - 파일 검증
            FileValidator.validateFile(request.getThumbnailImage(), maxImageSize);
            validateImageType(request.getThumbnailImage());
            return s3Service.upload(request.getThumbnailImage(), "portfolio/thumbnails");
        } else if (request.getThumbnailUrl() != null && !request.getThumbnailUrl().isEmpty()) {
            // 기존 썸네일 URL 재사용
            return request.getThumbnailUrl();
        } else {
            throw PortfolioException.thumbnailRequired();
        }
    }

    /**
     * 이미지 처리
     */
    private int processImages(Long portfolioId, UpdatePortfolioRequest request) throws IOException {
        if (request.getImageSequence() == null || request.getImageSequence().isEmpty()) {
            return 0; // 이미지 없음
        }

        String[] sequences = request.getImageSequence().split(",");
        byte order = 0;
        int newImageIndex = 0;

        for (String seq : sequences) {
            seq = seq.trim();
            final byte currentOrder = order;  // final 변수로 복사
            if (seq.startsWith("prev:")) {
                // 기존 이미지 재사용
                Long imageId = Long.parseLong(seq.substring(5));
                PortfolioImage existingImage = portfolioImageRepository.findById(imageId)
                        .orElseThrow(() -> new ResourceNotFoundException("이미지", imageId));

                // 원본 이미지 찾기
                PortfolioImage originalImage;
                if (existingImage.getOriginalImageId() == null) {
                    // 이미 원본 이미지인 경우
                    originalImage = existingImage;
                } else {
                    // 압축 이미지인 경우 -> 원본 찾기
                    originalImage = portfolioImageRepository.findById(existingImage.getOriginalImageId())
                            .orElseThrow(() -> new ResourceNotFoundException("원본 이미지"));;
                }

                // 원본 이미지 복사
                PortfolioImage newOriginalImage = PortfolioImage.builder()
                        .portfolioId(portfolioId)
                        .imageUrl(originalImage.getImageUrl())
                        .imageOrder(currentOrder)
                        .imageSize(originalImage.getImageSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                PortfolioImage savedOriginal = portfolioImageRepository.save(newOriginalImage);

                // 압축 이미지 찾아서 복사
                portfolioImageRepository.findByOriginalImageId(originalImage.getId())
                        .ifPresent(compressedImage -> {
                            PortfolioImage newCompressedImage = PortfolioImage.builder()
                                    .portfolioId(portfolioId)
                                    .originalImageId(savedOriginal.getId())
                                    .imageUrl(compressedImage.getImageUrl())
                                    .imageOrder(currentOrder)
                                    .imageSize(compressedImage.getImageSize())
                                    .uploadedAt(LocalDateTime.now())
                                    .build();
                            portfolioImageRepository.save(newCompressedImage);
                        });
            }
            else if (seq.startsWith("new:")) {
                // 새 이미지 업로드
                int index = Integer.parseInt(seq.substring(4));
                if (request.getNewImages() == null || index >= request.getNewImages().size()) {
                    throw PortfolioException.invalidImageIndex(index);
                }

                MultipartFile image = request.getNewImages().get(index);
                // 새 이미지 파일 검증
                FileValidator.validateFile(image, maxImageSize);
                validateImageType(image);

                ImageUploadResult result = imageService.uploadWithCompression(image, "portfolio/images");

                // 원본 이미지 저장
                PortfolioImage originalImage = PortfolioImage.builder()
                        .portfolioId(portfolioId)
                        .imageUrl(result.originalUrl())
                        .imageOrder(currentOrder)
                        .imageSize((int) image.getSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                PortfolioImage savedOriginal = portfolioImageRepository.save(originalImage);

                // 압축 이미지 저장
                PortfolioImage compressedImage = PortfolioImage.builder()
                        .portfolioId(portfolioId)
                        .originalImageId(savedOriginal.getId())
                        .imageUrl(result.compressedUrl())
                        .imageOrder(currentOrder)
                        .imageSize((int) result.compressedSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                portfolioImageRepository.save(compressedImage);

                newImageIndex++;
            } else {
                throw PortfolioException.invalidImageSequence(seq);
            }

            order++;
        }

        return sequences.length;
    }

    /**
     * 파일 처리
     */
    private int processFiles(Long portfolioId, UpdatePortfolioRequest request) throws IOException {
        if (request.getFileSequence() == null || request.getFileSequence().isEmpty()) {
            return 0; // 파일 없음
        }

        String[] sequences = request.getFileSequence().split(",");
        int newFileIndex = 0;

        for (String seq : sequences) {
            seq = seq.trim();

            if (seq.startsWith("prev:")) {
                // 기존 파일 재사용
                Long fileId = Long.parseLong(seq.substring(5));
                PortfolioFile existingFile = portfolioFileRepository.findById(fileId)
                        .orElseThrow(() -> new ResourceNotFoundException("파일", fileId));

                PortfolioFile newFile = PortfolioFile.builder()
                        .portfolioId(portfolioId)
                        .originalFileName(existingFile.getOriginalFileName())
                        .storedFileUrl(existingFile.getStoredFileUrl())
                        .fileType(existingFile.getFileType())
                        .fileSize(existingFile.getFileSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                portfolioFileRepository.save(newFile);

            } else if (seq.startsWith("new:")) {
                // 새 파일 업로드
                int index = Integer.parseInt(seq.substring(4));
                if (request.getNewFiles() == null || index >= request.getNewFiles().size()) {
                    throw PortfolioException.invalidFileIndex(index);
                }

                MultipartFile file = request.getNewFiles().get(index);
                String fileUrl = s3Service.upload(file, "portfolio/files");

                PortfolioFile portfolioFile = PortfolioFile.builder()
                        .portfolioId(portfolioId)
                        .originalFileName(file.getOriginalFilename())
                        .storedFileUrl(fileUrl)
                        .fileType(file.getContentType())
                        .fileSize((int) file.getSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                portfolioFileRepository.save(portfolioFile);

                newFileIndex++;
            } else {
                throw PortfolioException.invalidFileSequence(seq);
            }
        }

        return sequences.length;
    }

    /**
     * 내 포트폴리오 목록 조회
     * @param memberId 회원 ID
     * @return 포트폴리오 목록 DTO
     */
    public List<PortfolioListDto> getMyPortfolios(Integer memberId) {
        // 1. 삭제되지 않은 포트폴리오 목록 조회
        List<Portfolio> portfolios = portfolioRepository.findByMemberIdAndDeletedAtIsNull(memberId);

        // 2. DTO 변환
        return portfolios.stream()
                .map(portfolio -> {
                    // Position 정보 조회
                    Position position = positionRepository.findById(portfolio.getPositionId())
                            .orElseThrow(() -> PortfolioException.positionNotFound());

                    return PortfolioListDto.builder()
                            .portfolioId(portfolio.getId())
                            .positionId(portfolio.getPositionId())
                            .positionName(position.getPositionName())
                            .title(portfolio.getTitle())
                            .thumbnailImageUrl(portfolio.getThumbnailImageUrl())
                            .createdAt(portfolio.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 포트폴리오 상세 조회
     * @param portfolioId 포트폴리오 ID
     * @return 포트폴리오 상세 DTO
     */
    public PortfolioDetailDto getPortfolioDetail(Long portfolioId) {
        // 1. 포트폴리오 조회
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> PortfolioException.portfolioNotFound());

        // 2. 삭제된 포트폴리오 확인
        if (portfolio.getDeletedAt() != null) {
            throw PortfolioException.portfolioNotFound();
        }

        // 3. Position 정보 조회
        Position position = positionRepository.findById(portfolio.getPositionId())
                .orElseThrow(() -> PortfolioException.positionNotFound());

        // 4. Category 정보 조회
        Category category = categoryRepository.findById(position.getCategoryId())
                .orElseThrow(() -> PortfolioException.categoryNotFound());

        // 5. 이미지 목록 조회 (압축 이미지만, imageOrder 순으로)
        List<PortfolioImage> compressedImages =
                portfolioImageRepository.findByPortfolioIdAndOriginalImageIdIsNotNullOrderByImageOrderAsc(portfolioId);

        List<PortfolioDetailDto.ImageDto> imageDtos = compressedImages.stream()
                .map(compressedImage -> {
                    // 원본 이미지 찾기
                    PortfolioImage originalImage = portfolioImageRepository.findById(compressedImage.getOriginalImageId())
                            .orElseThrow(() -> PortfolioException.originalImageNotFound());

                    return PortfolioDetailDto.ImageDto.builder()
                            .imageId(compressedImage.getId())
                            .imageUrl(compressedImage.getImageUrl())
                            .originalImageUrl(originalImage.getImageUrl())
                            .imageOrder(compressedImage.getImageOrder())
                            .build();
                })
                .collect(Collectors.toList());

        // 6. 파일 목록 조회
        List<PortfolioFile> files = portfolioFileRepository.findByPortfolioId(portfolioId);

        List<PortfolioDetailDto.FileDto> fileDtos = files.stream()
                .map(file -> PortfolioDetailDto.FileDto.builder()
                        .fileId(file.getId())
                        .originalFileName(file.getOriginalFileName())
                        .storedFileUrl(file.getStoredFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .build())
                .collect(Collectors.toList());

        // 7. DTO 조합 및 반환
        return PortfolioDetailDto.builder()
                .portfolioId(portfolio.getId())
                .positionId(position.getId())
                .positionName(position.getPositionName())
                .categoryId(category.getId())
                .categoryName(category.getCategoryName())
                .title(portfolio.getTitle())
                .description(portfolio.getDescription())
                .thumbnailImageUrl(portfolio.getThumbnailImageUrl())
                .images(imageDtos)
                .files(fileDtos)
                .createdAt(portfolio.getCreatedAt())
                .build();
    }

    /**
     * 특정 포지션의 내 포트폴리오 조회
     * @param memberId 회원 ID
     * @param positionId 포지션 ID
     * @return 포트폴리오 DTO
     */
    public PortfolioListDto getMyPortfolioByPosition(Integer memberId, Integer positionId) {
        // 1. 해당 포지션의 포트폴리오 조회
        Portfolio portfolio = portfolioRepository.findByMemberIdAndPositionIdAndDeletedAtIsNull(memberId, positionId)
                .orElseThrow(() -> PortfolioException.portfolioNotFoundForPosition(positionId));

        // 2. Position 정보 조회
        Position position = positionRepository.findById(portfolio.getPositionId())
                .orElseThrow(() -> PortfolioException.positionNotFound());

        // 3. DTO 변환 및 반환
        return PortfolioListDto.builder()
                .portfolioId(portfolio.getId())
                .positionId(portfolio.getPositionId())
                .positionName(position.getPositionName())
                .title(portfolio.getTitle())
                .thumbnailImageUrl(portfolio.getThumbnailImageUrl())
                .createdAt(portfolio.getCreatedAt())
                .build();
    }
}