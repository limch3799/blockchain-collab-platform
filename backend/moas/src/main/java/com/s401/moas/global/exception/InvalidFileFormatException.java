package com.s401.moas.global.exception;

/**
 * 지원하지 않는 파일 형식 예외 (415 Unsupported Media Type)
 */
public class InvalidFileFormatException extends RuntimeException {

    public InvalidFileFormatException(String fileType) {
        super("지원하지 않는 파일 형식입니다: " + fileType);
    }

    public InvalidFileFormatException(String message, Throwable cause) {
        super(message, cause);
    }
}