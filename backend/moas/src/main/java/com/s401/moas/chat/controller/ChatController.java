package com.s401.moas.chat.controller;

import com.s401.moas.chat.controller.request.CreateChatroomRequest;
import com.s401.moas.chat.controller.request.GetChatMessagesRequest;
import com.s401.moas.chat.controller.request.SendMessageRequest;
import com.s401.moas.chat.controller.response.*;
import com.s401.moas.chat.service.ChatService;
import com.s401.moas.chat.service.dto.*;
import com.s401.moas.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 채팅 관리 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatController implements ChatControllerSpec {

    private final ChatService chatService;

    /**
     * 채팅방 생성
     * 프로젝트 내에서 특정 회원과의 1:1 채팅방을 생성합니다.
     * 이미 존재하는 경우 기존 채팅방을 반환합니다.
     *
     * @param request 채팅방 생성 요청 (projectId, otherMemberId)
     * @return 생성되거나 조회된 채팅방 정보
     */
    @PostMapping
    @Override
    public ResponseEntity<CreateChatroomResponse> createChatroom(
            @Valid @RequestBody CreateChatroomRequest request) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅방 생성 API 호출: myMemberId={}, request={}", myMemberId, request);

        CreateChatroomDto dto = chatService.createChatroom(myMemberId, request);

        String message = dto.isNewRoom()
                ? "채팅방 생성을 성공했습니다."
                : "기존 채팅방을 불러왔습니다.";

        CreateChatroomResponse response = CreateChatroomResponse.from(dto, message);

        HttpStatus status = dto.isNewRoom() ? HttpStatus.CREATED : HttpStatus.OK;

        log.info("채팅방 생성 완료: chatroomId={}, isNew={}", dto.getChatroomId(), dto.isNewRoom());

        return ResponseEntity.status(status).body(response);
    }

    @GetMapping
    @Override
    public ResponseEntity<ChatroomListResponse> getChatroomList() {
        Integer memberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅방 목록 조회 API 호출: memberId={}", memberId);

        ChatroomListDto dto = chatService.getChatroomList(memberId);
        ChatroomListResponse response = ChatroomListResponse.from(dto, "채팅방 목록 조회를 성공했습니다.");

        log.info("채팅방 목록 조회 완료: count={}", dto.getChatrooms().size());

        return ResponseEntity.ok(response);
    }

    /**
     * 채팅방 나가기
     * 참여 중인 채팅방에서 나갑니다.
     *
     * @param chatroomId 나갈 채팅방 ID
     * @return 퇴장 완료 정보
     */
    @DeleteMapping("/{chatroomId}")
    @Override
    public ResponseEntity<LeaveChatroomResponse> leaveChatroom(
            @PathVariable Long chatroomId) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅방 나가기 API 호출: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        LeaveChatroomDto dto = chatService.leaveChatroom(myMemberId, chatroomId);

        LeaveChatroomResponse response = LeaveChatroomResponse.from(
                dto,
                "채팅방 나가기를 성공했습니다."
        );

        log.info("채팅방 나가기 완료: chatroomId={}, leftAt={}", dto.getChatroomId(), dto.getLeftAt());

        return ResponseEntity.ok(response);
    }

    /**
     * 채팅 상대 차단
     * 채팅방의 상대방을 차단합니다.
     *
     * @param chatroomId 채팅방 ID
     * @return 차단 완료 정보
     */
    @PatchMapping("/{chatroomId}/block")
    @Override
    public ResponseEntity<BlockChatMemberResponse> blockChatMember(
            @PathVariable Long chatroomId) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅 상대 차단 API 호출: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        BlockChatMemberDto dto = chatService.blockChatMember(myMemberId, chatroomId);

        BlockChatMemberResponse response = BlockChatMemberResponse.from(
                dto,
                "채팅 상대를 차단했습니다."
        );

        log.info("채팅 상대 차단 완료: chatroomId={}, isBlocked={}", dto.getChatroomId(), dto.getIsBlocked());

        return ResponseEntity.ok(response);
    }

    /**
     * 채팅 상대 차단 해제
     * 차단한 채팅 상대를 해제합니다.
     *
     * @param chatroomId 채팅방 ID
     * @return 차단 해제 완료 정보
     */
    @PatchMapping("/{chatroomId}/unblock")
    @Override
    public ResponseEntity<BlockChatMemberResponse> unblockChatMember(
            @PathVariable Long chatroomId) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅 상대 차단 해제 API 호출: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        BlockChatMemberDto dto = chatService.unblockChatMember(myMemberId, chatroomId);

        BlockChatMemberResponse response = BlockChatMemberResponse.from(
                dto,
                "채팅 상대 차단을 해제했습니다."
        );

        log.info("채팅 상대 차단 해제 완료: chatroomId={}, isBlocked={}", dto.getChatroomId(), dto.getIsBlocked());

        return ResponseEntity.ok(response);
    }

    /**
     * 채팅 메시지 전송
     * 채팅방에 메시지를 전송합니다. 파일 첨부가 가능합니다.
     *
     * @param chatroomId 채팅방 ID
     * @param request 메시지 내용 및 첨부 파일
     * @return 전송된 메시지 정보
     */
    @PostMapping(value = "/{chatroomId}/messages")
    @Override
    public ResponseEntity<SendMessageResponse> sendMessage(
            @PathVariable Long chatroomId,
            @Valid @ModelAttribute SendMessageRequest request) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("메시지 전송 API 호출: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        log.info("메시지 내용 : {}", request.getContent());

        SendMessageDto dto = chatService.sendMessage(myMemberId, chatroomId, request);

        SendMessageResponse response = SendMessageResponse.from(dto, "메시지 전송을 성공했습니다.");

        log.info("메시지 전송 완료: messageId={}", dto.getMessageId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 채팅방 메시지 조회
     * 채팅방의 메시지 목록을 커서 기반 페이징으로 조회합니다.
     *
     * @param chatroomId 채팅방 ID
     * @param request 조회 조건 (lastMessageId, size)
     * @return 메시지 목록 및 채팅방 정보
     */
    @GetMapping("/{chatroomId}/messages")
    @Override
    public ResponseEntity<GetChatMessagesResponse> getChatMessages(
            @PathVariable Long chatroomId,
            @Valid @ModelAttribute GetChatMessagesRequest request) {

        Integer myMemberId = SecurityUtil.getCurrentMemberId();

        log.info("채팅방 메시지 조회 API 호출: myMemberId={}, chatroomId={}, lastMessageId={}, size={}",
                myMemberId, chatroomId, request.getLastMessageId(), request.getSize());

        GetChatMessagesDto dto = chatService.getChatMessages(
                myMemberId, chatroomId, request.getLastMessageId(), request.getSize());

        GetChatMessagesResponse response = GetChatMessagesResponse.from(dto, "채팅방 메시지 조회를 성공했습니다.");

        log.info("채팅방 메시지 조회 완료: chatroomId={}, messageCount={}", chatroomId, dto.getMessages().size());

        return ResponseEntity.ok(response);
    }
}