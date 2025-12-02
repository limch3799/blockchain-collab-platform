package com.s401.moas.admin.project.exception;

import com.s401.moas.global.exception.base.BaseException;

public class AdminProjectException extends BaseException {

    public AdminProjectException(AdminProjectErrorCode errorCode) {
        super(errorCode);
    }

    // 프로젝트를 찾을 수 없음
    public static AdminProjectException projectNotFound() {
        return new AdminProjectException(AdminProjectErrorCode.PROJECT_NOT_FOUND);
    }

    // 이미 삭제된 프로젝트
    public static AdminProjectException projectAlreadyDeleted() {
        return new AdminProjectException(AdminProjectErrorCode.PROJECT_ALREADY_DELETED);
    }
}