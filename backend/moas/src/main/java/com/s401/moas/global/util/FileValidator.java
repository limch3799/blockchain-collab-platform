package com.s401.moas.global.util;

import com.s401.moas.global.exception.FileSizeLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
public class FileValidator {

    /**
     * 파일 목록 유효성 검증
     * @param files 검증할 파일 목록
     * @param maxFiles 최대 파일 개수
     * @param maxFileSize 개별 파일 최대 크기 (bytes)
     * @param maxTotalSize 전체 파일 최대 크기 (bytes)
     */
    public static void validateFiles(List<MultipartFile> files,
                                     int maxFiles,
                                     long maxFileSize,
                                     long maxTotalSize) {
        if (files == null || files.isEmpty()) {
            return;
        }

        // 1. 파일 개수 검증
        if (files.size() > maxFiles) {
            throw new IllegalArgumentException(
                    String.format("파일은 최대 %d개까지 업로드 가능합니다.", maxFiles)
            );
        }

        // 2. 각 파일 크기 및 빈 파일 검증
        long totalSize = 0;
        for (MultipartFile file : files) {
            // 빈 파일 검증
            if (file.isEmpty()) {
                throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
            }

            // 개별 파일 크기 검증
            if (file.getSize() > maxFileSize) {
                throw new FileSizeLimitExceededException(file.getSize(), maxFileSize);
            }

            totalSize += file.getSize();
        }

        // 3. 총 파일 크기 검증
        if (totalSize > maxTotalSize) {
            throw new FileSizeLimitExceededException(totalSize, maxTotalSize);
        }

        log.debug("파일 검증 완료 - 파일 개수: {}, 총 크기: {} bytes", files.size(), totalSize);
    }

    /**
     * 단일 파일 유효성 검증
     */
    public static void validateFile(MultipartFile file, long maxFileSize) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        if (file.getSize() > maxFileSize) {
            throw new FileSizeLimitExceededException(file.getSize(), maxFileSize);
        }
    }
}