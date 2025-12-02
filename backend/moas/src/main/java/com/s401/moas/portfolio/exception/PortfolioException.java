package com.s401.moas.portfolio.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Portfolio 도메인 서버 예외
 */
public class PortfolioException extends BaseException {

    public PortfolioException(PortfolioErrorCode errorCode) {
        super(errorCode);
    }

    public PortfolioException(PortfolioErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public PortfolioException(PortfolioErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public PortfolioException(PortfolioErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    // S3 파일 처리 관련
    public static PortfolioException s3UploadFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.S3_UPLOAD_FAILED, cause);
    }

    public static PortfolioException s3DeleteFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.S3_DELETE_FAILED, cause);
    }

    // 이미지 처리 관련
    public static PortfolioException imageCompressionFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.IMAGE_COMPRESSION_FAILED, cause);
    }

    public static PortfolioException imageProcessingFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.IMAGE_PROCESSING_FAILED, cause);
    }

    // 포트폴리오 CRUD 관련
    public static PortfolioException portfolioNotFound() {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_NOT_FOUND);
    }

    public static PortfolioException portfolioNotFound(Long portfolioId) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_NOT_FOUND, portfolioId);
    }

    public static PortfolioException portfolioSaveFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_SAVE_FAILED, cause);
    }

    public static PortfolioException portfolioUpdateFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_UPDATE_FAILED, cause);
    }

    public static PortfolioException portfolioDeleteFailed(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_DELETE_FAILED, cause);
    }

    // 데이터베이스 관련
    public static PortfolioException databaseError(Throwable cause) {
        return new PortfolioException(PortfolioErrorCode.DATABASE_ERROR, cause);
    }

    public static PortfolioException portfolioAccessDenied() {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_ACCESS_DENIED);
    }

    public static PortfolioException portfolioAlreadyDeleted() {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_ALREADY_DELETED);
    }

    // 포트폴리오 수정 관련
    public static PortfolioException invalidImageSequence(String sequence) {
        return new PortfolioException(PortfolioErrorCode.INVALID_IMAGE_SEQUENCE, sequence);
    }

    public static PortfolioException invalidFileSequence(String sequence) {
        return new PortfolioException(PortfolioErrorCode.INVALID_FILE_SEQUENCE, sequence);
    }

    public static PortfolioException invalidImageIndex(int index) {
        return new PortfolioException(PortfolioErrorCode.INVALID_IMAGE_INDEX, index);
    }

    public static PortfolioException invalidFileIndex(int index) {
        return new PortfolioException(PortfolioErrorCode.INVALID_FILE_INDEX, index);
    }

    public static PortfolioException thumbnailRequired() {
        return new PortfolioException(PortfolioErrorCode.THUMBNAIL_REQUIRED);
    }

    public static PortfolioException positionNotFound() {
        return new PortfolioException(PortfolioErrorCode.POSITION_NOT_FOUND);
    }

    public static PortfolioException categoryNotFound() {
        return new PortfolioException(PortfolioErrorCode.CATEGORY_NOT_FOUND);
    }

    public static PortfolioException originalImageNotFound() {
        return new PortfolioException(PortfolioErrorCode.ORIGINAL_IMAGE_NOT_FOUND);
    }

    public static PortfolioException portfolioAlreadyExistsForPosition(Integer positionId) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_ALREADY_EXISTS_FOR_POSITION, positionId);
    }

    public static PortfolioException portfolioNotFoundForPosition(Integer positionId) {
        return new PortfolioException(PortfolioErrorCode.PORTFOLIO_NOT_FOUND_FOR_POSITION, positionId);
    }
}
