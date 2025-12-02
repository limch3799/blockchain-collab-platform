package com.s401.moas.chat.exception;

import com.s401.moas.global.exception.base.BaseException;

/**
 * Chat 도메인 예외
 */
public class ChatException extends BaseException {

    public ChatException(ChatErrorCode errorCode) {
        super(errorCode);
    }

    public ChatException(ChatErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public ChatException(ChatErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public ChatException(ChatErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode, cause, args);
    }

    // ============================================
    // 정적 팩토리 메소드들
    // ============================================

    /**
     * 프로젝트를 찾을 수 없음
     */
    public static ChatException projectNotFound(Integer projectId) {
        return new ChatException(ChatErrorCode.PROJECT_NOT_FOUND, projectId);
    }

    /**
     * 회원을 찾을 수 없음
     */
    public static ChatException memberNotFound(Integer memberId) {
        return new ChatException(ChatErrorCode.MEMBER_NOT_FOUND, memberId);
    }

    /**
     * 채팅방을 찾을 수 없음
     */
    public static ChatException chatroomNotFound(Long chatroomId) {
        return new ChatException(ChatErrorCode.CHATROOM_NOT_FOUND, chatroomId);
    }

    /**
     * 상대방이 채팅을 거부함
     */
    public static ChatException chatBlocked() {
        return new ChatException(ChatErrorCode.CHAT_BLOCKED);
    }

    /**
     * 채팅방 접근 권한 없음
     */
    public static ChatException chatAccessDenied() {
        return new ChatException(ChatErrorCode.CHAT_ACCESS_DENIED);
    }

    public static ChatException chatMemberNotFound() {
        return new ChatException(ChatErrorCode.MEMBER_NOT_FOUND);
    }

    /**
     * 자기 자신과 채팅 불가
     */
    public static ChatException cannotChatWithSelf() {
        return new ChatException(ChatErrorCode.CANNOT_CHAT_WITH_SELF);
    }
    /**
     * 이미 퇴장한 채팅방
     */
    public static ChatException alreadyLeftChatroom() {
        return new ChatException(ChatErrorCode.ALREADY_LEFT_CHATROOM);
    }
    /**
     * 이미 차단한 사용자
     */
    public static ChatException alreadyBlocked() {
        return new ChatException(ChatErrorCode.ALREADY_BLOCKED);
    }

    /**
     * 차단되지 않은 사용자
     */
    public static ChatException notBlocked() {
        return new ChatException(ChatErrorCode.NOT_BLOCKED);
    }

    /**
     * 파일 용량 초과
     */
    public static ChatException invalidFileSize() {
        return new ChatException(ChatErrorCode.INVALID_FILE_SIZE);
    }

    /**
     * 지원하지 않는 파일 형식
     */
    public static ChatException unsupportedFileType() {
        return new ChatException(ChatErrorCode.UNSUPPORTED_FILE_TYPE);
    }

    /**
     * 메시지 길이 초과
     */
    public static ChatException messageTooLong() {
        return new ChatException(ChatErrorCode.MESSAGE_TOO_LONG);
    }

    /**
     * 메시지 내용과 파일 모두 없음
     */
    public static ChatException emptyMessageAndFiles() {
        return new ChatException(ChatErrorCode.EMPTY_MESSAGE_AND_FILES);
    }

    /**
     * 파일 개수 초과
     */
    public static ChatException tooManyFiles() {
        return new ChatException(ChatErrorCode.TOO_MANY_FILES);
    }

    /**
     * 파일 크기 초과
     */
    public static ChatException fileSizeExceeded() {
        return new ChatException(ChatErrorCode.FILE_SIZE_EXCEEDED);
    }

    /**
     * 파일 업로드 실패
     */
    public static ChatException fileUploadFailed() {
        return new ChatException(ChatErrorCode.FILE_UPLOAD_FAILED);
    }
}