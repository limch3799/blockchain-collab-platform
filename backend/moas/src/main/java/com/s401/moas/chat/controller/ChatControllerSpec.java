package com.s401.moas.chat.controller;

import com.s401.moas.chat.controller.request.CreateChatroomRequest;
import com.s401.moas.chat.controller.request.GetChatMessagesRequest;
import com.s401.moas.chat.controller.request.SendMessageRequest;
import com.s401.moas.chat.controller.response.*;
import com.s401.moas.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Chat", description = "채팅 관리 API")
public interface ChatControllerSpec {

    @Operation(
            operationId = "1-createChatroom",
            summary = "채팅방 생성",
            description = "프로젝트 내에서 특정 회원과의 1:1 채팅방을 생성합니다. " +
                    "이미 존재하는 경우 기존 채팅방을 반환합니다. " +
                    "나간 상태에서 재생성 시 재입장 처리됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "채팅방 생성 성공",
                    content = @Content(schema = @Schema(implementation = CreateChatroomResponse.class))
            ),
            @ApiResponse(
                    responseCode = "200",
                    description = "기존 채팅방 반환 (재입장 포함)",
                    content = @Content(schema = @Schema(implementation = CreateChatroomResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 값 누락 또는 유효성 검사 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"projectId: must not be null.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "프로젝트 또는 회원을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "상대방이 채팅을 거부함 - errorCode: CHAT_BLOCKED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_BLOCKED\",\"message\":\"채팅방을 생성할 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<CreateChatroomResponse> createChatroom(
            @Valid @RequestBody CreateChatroomRequest request
    );

    @Operation(
            operationId = "2-getChatroomList",
            summary = "채팅방 목록 조회",
            description = "내가 참여 중인 채팅방 목록을 조회합니다. 최신 메시지 순으로 정렬됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "채팅방 목록 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = ChatroomListResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<ChatroomListResponse> getChatroomList();

    @Operation(
            operationId = "3-leaveChatroom",
            summary = "채팅방 나가기",
            description = "참여 중인 채팅방에서 나갑니다. 나간 후에도 재입장이 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "채팅방 나가기 성공",
                    content = @Content(schema = @Schema(implementation = LeaveChatroomResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "채팅방 참여자가 아님 - errorCode: CHAT_ACCESS_DENIED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_ACCESS_DENIED\",\"message\":\"채팅방에 접근할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "채팅방을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "이미 퇴장한 채팅방 - errorCode: ALREADY_LEFT_CHATROOM",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"ALREADY_LEFT_CHATROOM\",\"message\":\"이미 퇴장한 채팅방입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<LeaveChatroomResponse> leaveChatroom(Long chatroomId);

    @Operation(
            operationId = "4-blockChatMember",
            summary = "채팅 상대 차단",
            description = "채팅방의 상대방을 차단합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "채팅 상대 차단 성공",
                    content = @Content(schema = @Schema(implementation = BlockChatMemberResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "채팅방 참여자가 아님 - errorCode: CHAT_ACCESS_DENIED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_ACCESS_DENIED\",\"message\":\"채팅방에 접근할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "채팅방을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "이미 차단한 사용자 - errorCode: ALREADY_BLOCKED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"ALREADY_BLOCKED\",\"message\":\"이미 차단한 사용자입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<BlockChatMemberResponse> blockChatMember(Long chatroomId);

    @Operation(
            operationId = "5-unblockChatMember",
            summary = "채팅 상대 차단 해제",
            description = "차단한 채팅 상대를 해제합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "채팅 상대 차단 해제 성공",
                    content = @Content(schema = @Schema(implementation = BlockChatMemberResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "채팅방 참여자가 아님 - errorCode: CHAT_ACCESS_DENIED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_ACCESS_DENIED\",\"message\":\"채팅방에 접근할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "채팅방을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "차단되지 않은 사용자 - errorCode: NOT_BLOCKED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_BLOCKED\",\"message\":\"차단되지 않은 사용자입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<BlockChatMemberResponse> unblockChatMember(Long chatroomId);

    @Operation(
            operationId = "6-sendMessage",
            summary = "채팅 메시지 전송",
            description = "채팅방에 메시지를 전송합니다. 파일 첨부가 가능하며, 전송된 메시지는 WebSocket을 통해 실시간으로 브로드캐스트됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "메시지 전송 성공",
                    content = @Content(schema = @Schema(implementation = SendMessageResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 값 누락, 유효성 검사 실패) - errorCode: BAD_REQUEST",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"BAD_REQUEST\",\"message\":\"잘못된 요청입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "채팅방 참여자가 아니거나 퇴장한 상태 - errorCode: CHAT_ACCESS_DENIED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_ACCESS_DENIED\",\"message\":\"채팅방에 접근할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "채팅방을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "차단된 채팅방에 메시지 전송 시도 - errorCode: CHAT_BLOCKED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_BLOCKED\",\"message\":\"차단된 채팅방에는 메시지를 보낼 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "파일 용량 초과 - errorCode: PAYLOAD_TOO_LARGE",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"PAYLOAD_TOO_LARGE\",\"message\":\"파일 용량이 너무 큽니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "415",
                    description = "지원하지 않는 파일 형식 - errorCode: UNSUPPORTED_MEDIA_TYPE",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNSUPPORTED_MEDIA_TYPE\",\"message\":\"지원하지 않는 파일 형식입니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<SendMessageResponse> sendMessage(
            @PathVariable Long chatroomId,
            @Valid @ModelAttribute SendMessageRequest request
    );

    @Operation(
            operationId = "7-getChatMessages",
            summary = "채팅방 메시지 조회",
            description = "채팅방의 메시지 목록을 커서 기반 페이징으로 조회합니다. 조회 시 자동으로 읽음 처리됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "메시지 조회 성공",
                    content = @Content(schema = @Schema(implementation = GetChatMessagesResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자 - errorCode: UNAUTHORIZED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"인증이 필요합니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "채팅방 참여자가 아니거나 퇴장한 상태 - errorCode: CHAT_ACCESS_DENIED",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"CHAT_ACCESS_DENIED\",\"message\":\"채팅방에 접근할 권한이 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "채팅방을 찾을 수 없음 - errorCode: NOT_FOUND",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"NOT_FOUND\",\"message\":\"요청한 리소스를 찾을 수 없습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류 - errorCode: INTERNAL_SERVER_ERROR",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = "{\"errorCode\":\"INTERNAL_SERVER_ERROR\",\"message\":\"서버 내부 오류가 발생했습니다.\",\"timestamp\":1699999999999}"
                            )
                    )
            )
    })
    ResponseEntity<GetChatMessagesResponse> getChatMessages(
            @PathVariable Long chatroomId,
            @Valid @ModelAttribute GetChatMessagesRequest request
    );
}