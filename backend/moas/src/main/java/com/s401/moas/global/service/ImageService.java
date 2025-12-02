package com.s401.moas.global.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Service s3Service;

    private static final int COMPRESSED_WIDTH = 800;  // 압축 이미지 최대 너비
    private static final int COMPRESSED_HEIGHT = 800; // 압축 이미지 최대 높이
    private static final float WEBP_QUALITY = 0.8f;   // WebP 품질 (0.0 ~ 1.0)

    /**
     * 이미지 업로드 (원본 + WebP 압축본)
     * @param image 업로드할 이미지
     * @param dirName 저장할 디렉토리 (예: "portfolio/images")
     * @return 원본 URL과 압축본 URL
     */
    public ImageUploadResult uploadWithCompression(MultipartFile image, String dirName) throws IOException {
        // 1. 원본 업로드
        String originalUrl = s3Service.upload(image, dirName + "/original");
        log.info("원본 이미지 업로드 완료: {}", originalUrl);

        // 2. WebP 압축본 생성 및 업로드
        MultipartFile compressedImage = compressToWebP(image);
        String compressedUrl = s3Service.upload(compressedImage, dirName + "/compressed");
        log.info("압축 이미지 업로드 완료: {}", compressedUrl);

        // 3. 압축된 파일 크기 포함하여 반환
        return new ImageUploadResult(originalUrl, compressedUrl, compressedImage.getSize());
    }

    /**
     * 이미지를 WebP 포맷으로 압축
     */
    private MultipartFile compressToWebP(MultipartFile image) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        Thumbnails.of(image.getInputStream())
                .size(COMPRESSED_WIDTH, COMPRESSED_HEIGHT)
                .outputFormat("webp")
                .outputQuality(WEBP_QUALITY)
                .toOutputStream(outputStream);

        byte[] compressedBytes = outputStream.toByteArray();
        String newFileName = getFileNameWithoutExtension(image.getOriginalFilename()) + ".webp";

        return new CustomMultipartFile(
                compressedBytes,
                newFileName,
                "image/webp"
        );
    }

    /**
     * 파일명에서 확장자 제거
     */
    private String getFileNameWithoutExtension(String fileName) {
        if (fileName == null) return "image";
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    }

    /**
     * 이미지 업로드 결과 DTO
     */
    public record ImageUploadResult(
            String originalUrl,
            String compressedUrl,
            long compressedSize
    ) {}

    /**
     * 압축된 이미지를 MultipartFile로 변환하기 위한 커스텀 클래스
     */
    private static class CustomMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String name;
        private final String contentType;

        public CustomMultipartFile(byte[] content, String name, String contentType) {
            this.content = content;
            this.name = name;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return name;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() {
            return content;
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException {
            throw new UnsupportedOperationException("transferTo not supported");
        }
    }
}