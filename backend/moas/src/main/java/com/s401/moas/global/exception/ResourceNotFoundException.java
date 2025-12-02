package com.s401.moas.global.exception;

/**
 * 404 Not Found 처리를 위한 간단한 예외
 * 리소스를 찾을 수 없는 경우 사용
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource) {
        super(resource + "을(를) 찾을 수 없습니다.");
    }

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + "(ID: " + id + ")을(를) 찾을 수 없습니다.");
    }
}
