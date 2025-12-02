package com.s401.moas.global.exception;

/**
 * 파일 크기 제한 초과 예외 (413 Payload Too Large)
 */
public class FileSizeLimitExceededException extends RuntimeException {

    public FileSizeLimitExceededException(String message) {
        super(message);
    }

    public FileSizeLimitExceededException(long currentSize, long maxSize) {
        super(String.format("파일 크기가 제한을 초과했습니다. (현재: %d bytes, 최대: %d bytes)", currentSize, maxSize));
    }
}