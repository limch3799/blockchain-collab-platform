package com.s401.moas.project.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Project 도메인 예외
 */
public class ProjectException extends BaseException {

    public ProjectException(ProjectErrorCode errorCode) {
        super(errorCode);
    }

    public ProjectException(ProjectErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public ProjectException(ProjectErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public ProjectException(ProjectErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    /**
     * 프로젝트를 찾을 수 없음
     */
    public static ProjectException projectNotFound(Integer projectId) {
        return new ProjectException(ProjectErrorCode.PROJECT_NOT_FOUND, projectId);
    }

    /**
     * 프로젝트 포지션을 찾을 수 없음
     */
    public static ProjectException projectPositionNotFound(Long positionId) {
        return new ProjectException(ProjectErrorCode.PROJECT_POSITION_NOT_FOUND, positionId);
    }

    /**
     * 프로젝트 접근 권한 없음 (소유자가 아님)
     */
    public static ProjectException projectAccessDenied() {
        return new ProjectException(ProjectErrorCode.PROJECT_ACCESS_DENIED);
    }

    /**
     * 프로젝트와 포지션이 일치하지 않음
     */
    public static ProjectException projectPositionMismatch() {
        return new ProjectException(ProjectErrorCode.PROJECT_POSITION_MISMATCH);
    }

    /**
     * 지원자가 있어 포지션 삭제 불가
     */
    public static ProjectException cannotDeletePositionWithApplications() {
        return new ProjectException(ProjectErrorCode.CANNOT_DELETE_POSITION_WITH_APPLICATIONS);
    }

    /**
     * 날짜 관계가 올바르지 않음
     */
    public static ProjectException invalidDateRange() {
        return new ProjectException(ProjectErrorCode.INVALID_DATE_RANGE);
    }

    /**
     * 중복된 포지션 ID
     */
    public static ProjectException duplicatePositionIds() {
        return new ProjectException(ProjectErrorCode.DUPLICATE_POSITION_IDS);
    }

    /**
     * 마감 또는 종료된 프로젝트
     */
    public static ProjectException projectAlreadyClosed() {
        return new ProjectException(ProjectErrorCode.PROJECT_ALREADY_CLOSED);
    }

    /**
     * 이미 북마크한 프로젝트
     */
    public static ProjectException projectBookmarkAlreadyExists() {
        return new ProjectException(ProjectErrorCode.PROJECT_BOOKMARK_ALREADY_EXISTS);
    }

    /**
     * 북마크를 찾을 수 없음
     */
    public static ProjectException projectBookmarkNotFound() {
        return new ProjectException(ProjectErrorCode.PROJECT_BOOKMARK_NOT_FOUND);
    }

    /**
     * 이미 마감된 포지션
     */
    public static ProjectException projectPositionAlreadyClosed() {
        return new ProjectException(ProjectErrorCode.PROJECT_POSITION_ALREADY_CLOSED);
    }
}

