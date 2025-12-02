package com.s401.moas.portfolio.exception;

import com.s401.moas.global.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Portfolio 도메인 서버 오류 코드
 */
public enum PortfolioErrorCode implements BaseErrorCode {

    // S3 파일 처리 관련
    S3_UPLOAD_FAILED("PF_S001", "파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    S3_DELETE_FAILED("PF_S002", "파일 삭제에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // 이미지 처리 관련
    IMAGE_COMPRESSION_FAILED("PF_S003", "이미지 압축에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_PROCESSING_FAILED("PF_S004", "이미지 처리에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // 포트폴리오 CRUD 관련
    PORTFOLIO_NOT_FOUND("PF_S005", "포트폴리오를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    PORTFOLIO_SAVE_FAILED("PF_S006", "포트폴리오 저장에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    PORTFOLIO_UPDATE_FAILED("PF_S007", "포트폴리오 수정에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    PORTFOLIO_DELETE_FAILED("PF_S008", "포트폴리오 삭제에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // 데이터베이스 관련
    DATABASE_ERROR("PF_S009", "데이터베이스 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    // PortfolioErrorCode.java에 추가
    PORTFOLIO_ACCESS_DENIED("PF_S010", "해당 포트폴리오에 대한 권한이 없습니다.", HttpStatus.FORBIDDEN),
    PORTFOLIO_ALREADY_DELETED("PF_S011", "이미 삭제된 포트폴리오입니다.", HttpStatus.BAD_REQUEST),
    POSITION_NOT_FOUND("PF_S012", "포지션 정보를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_NOT_FOUND("PF_S013", "카테고리 정보를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    ORIGINAL_IMAGE_NOT_FOUND("PF_S014", "원본 이미지를 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // 포트폴리오 수정 관련
    INVALID_IMAGE_SEQUENCE("PF_C001", "잘못된 이미지 시퀀스 형식입니다.", HttpStatus.BAD_REQUEST),
    INVALID_FILE_SEQUENCE("PF_C002", "잘못된 파일 시퀀스 형식입니다.", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_INDEX("PF_C003", "잘못된 이미지 인덱스입니다.", HttpStatus.BAD_REQUEST),
    INVALID_FILE_INDEX("PF_C004", "잘못된 파일 인덱스입니다.", HttpStatus.BAD_REQUEST),
    THUMBNAIL_REQUIRED("PF_C005", "썸네일 이미지 또는 URL이 필요합니다.", HttpStatus.BAD_REQUEST),
    PORTFOLIO_ALREADY_EXISTS_FOR_POSITION("PF_C006", "해당 포지션에 이미 포트폴리오가 존재합니다.", HttpStatus.BAD_REQUEST),
    PORTFOLIO_NOT_FOUND_FOR_POSITION("PF_C007", "해당 포지션에 대한 포트폴리오가 없습니다.", HttpStatus.NOT_FOUND);





    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    PortfolioErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
