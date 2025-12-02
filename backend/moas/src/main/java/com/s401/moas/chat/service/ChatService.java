package com.s401.moas.chat.service;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.chat.controller.request.CreateChatroomRequest;
import com.s401.moas.chat.controller.request.SendMessageRequest;
import com.s401.moas.chat.domain.ChatMember;
import com.s401.moas.chat.domain.ChatMessageFile;
import com.s401.moas.chat.domain.Chatroom;
import com.s401.moas.chat.exception.ChatException;
import com.s401.moas.chat.repository.ChatMemberRepository;
import com.s401.moas.chat.repository.ChatMessageFileRepository;
import com.s401.moas.chat.repository.ChatMessageRepository;
import com.s401.moas.chat.repository.ChatroomRepository;
import com.s401.moas.chat.service.dto.*;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.global.util.FileValidator;
import com.s401.moas.global.sse.service.SseService;
import com.s401.moas.global.sse.service.dto.ChatMessageEventDto;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.s401.moas.chat.domain.ChatMessage;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatroomRepository chatroomRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageFileRepository chatMessageFileRepository;
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final S3Service s3Service;
    private final SseService sseService;

    @Value("${chat.file.max-files:10}")
    private int maxFiles;

    @Value("${chat.file.max-file-size:10485760}")  // 10MB
    private long maxFileSize;

    @Value("${chat.file.max-total-size:104857600}")  // 100MB
    private long maxTotalSize;

    @Transactional
    public CreateChatroomDto createChatroom(Integer myMemberId, CreateChatroomRequest request) {
        Integer projectId = request.getProjectId();
        Integer otherMemberId = request.getOtherMemberId();

        log.info("채팅방 생성 요청: myMemberId={}, projectId={}, otherMemberId={}",
                myMemberId, projectId, otherMemberId);

        // 0. 자기 자신과 채팅 불가 검증
        if (myMemberId.equals(otherMemberId)) {
            log.warn("자기 자신과 채팅 시도: memberId={}", myMemberId);
            throw ChatException.cannotChatWithSelf();
        }

        // 1. 프로젝트 존재 여부 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ChatException.projectNotFound(projectId));

        // 2. 상대방 회원 존재 여부 확인
        Member otherMember = memberRepository.findById(otherMemberId)
                .orElseThrow(() -> ChatException.memberNotFound(otherMemberId));

        // 3. 기존 채팅방 존재 여부 확인
        Optional<Chatroom> existingChatroom = chatroomRepository
                .findByProjectIdAndTwoMembers(projectId, myMemberId, otherMemberId);

        if (existingChatroom.isPresent()) {
            // 기존 채팅방이 있는 경우
            Chatroom chatroom = existingChatroom.get();
            List<ChatMember> members = chatMemberRepository.findByChatroomId(chatroom.getId());

            ChatMember myChatMember = members.stream()
                    .filter(m -> m.getMemberId().equals(myMemberId))
                    .findFirst()
                    .orElseThrow();

            ChatMember otherChatMember = members.stream()
                    .filter(m -> m.getMemberId().equals(otherMemberId))
                    .findFirst()
                    .orElseThrow();

            // 내가 나간 상태라면 재입장 (이때만 차단 체크)
            if (myChatMember.getLeftAt() != null) {
                // 재입장 시에만 차단 체크
                if (otherChatMember.getIsBlocked() || myChatMember.getIsBlocked()) {
                    log.warn("차단된 상태에서 재입장 시도: chatroomId={}", chatroom.getId());
                    throw ChatException.chatBlocked();
                }

                log.info("채팅방 재입장: chatroomId={}, memberId={}", chatroom.getId(), myMemberId);
                myChatMember.rejoin();
                myChatMember.activate();  // isValid = true로 복구
                chatMemberRepository.save(myChatMember);
            }

            log.info("기존 채팅방 반환: chatroomId={}", chatroom.getId());

            return CreateChatroomDto.builder()
                    .chatroomId(chatroom.getId())
                    .projectId(projectId)
                    .projectTitle(project.getTitle())
                    .otherMemberId(otherMemberId)
                    .otherMemberName(otherMember.getNickname())
                    .otherMemberProfileUrl(otherMember.getProfileImageUrl())
                    .createdAt(chatroom.getCreatedAt())
                    .isNewRoom(false)  // 기존 방
                    .build();
        }

        // 4. 새 채팅방 생성
        Chatroom newChatroom = Chatroom.builder()
                .projectId(projectId.intValue())
                .build();
        chatroomRepository.save(newChatroom);

        // 5. 채팅 멤버 2명 생성
        ChatMember myChatMember = ChatMember.builder()
                .chatroomId(newChatroom.getId())
                .memberId(myMemberId)
                .isBlocked(false)
                .isValid(true)
                .build();
        chatMemberRepository.save(myChatMember);

        ChatMember otherChatMember = ChatMember.builder()
                .chatroomId(newChatroom.getId())
                .memberId(otherMemberId)
                .isBlocked(false)
                .isValid(true)
                .build();
        chatMemberRepository.save(otherChatMember);

        log.info("새 채팅방 생성 완료: chatroomId={}", newChatroom.getId());

        return CreateChatroomDto.builder()
                .chatroomId(newChatroom.getId())
                .projectId(projectId)
                .projectTitle(project.getTitle())
                .otherMemberId(otherMemberId)
                .otherMemberName(otherMember.getNickname())
                .otherMemberProfileUrl(otherMember.getProfileImageUrl())
                .createdAt(newChatroom.getCreatedAt())
                .isNewRoom(true)  // 새로운 방
                .build();
    }

    @Transactional(readOnly = true)
    public ChatroomListDto getChatroomList(Integer myMemberId) {
        log.info("채팅방 목록 조회: memberId={}", myMemberId);

        // 1. 내가 참여 중인 채팅방 목록 조회 (퇴장하지 않은 것만)
        List<ChatMember> myChatMembers = chatMemberRepository.findByMemberIdAndLeftAtIsNull(myMemberId);

        // 2. 각 채팅방 정보 조회 및 DTO 변환
        List<ChatroomListDto.ChatroomItemDto> chatroomItems = myChatMembers.stream()
                .map(myChatMember -> {
                    Long chatroomId = myChatMember.getChatroomId();

                    // 채팅방 정보
                    Chatroom chatroom = chatroomRepository.findById(chatroomId)
                            .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

                    // 프로젝트 정보
                    Integer projectId = chatroom.getProjectId();
                    String projectTitle = projectRepository.findTitleById(projectId).orElse(null);

                    // 상대방 정보 조회
                    ChatMember otherChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                            .filter(cm -> !cm.getMemberId().equals(myMemberId))
                            .findFirst()
                            .orElseThrow(() -> ChatException.chatMemberNotFound());

                    Member otherMember = memberRepository.findById(otherChatMember.getMemberId())
                            .orElseThrow(() -> ChatException.memberNotFound(otherChatMember.getMemberId()));

                    // 마지막 메시지 조회
                    Optional<ChatMessage> lastMessage = chatMessageRepository
                            .findFirstByChatroomId(chatroomId);

                    // 안 읽은 메시지 개수 계산
                    Integer unreadCount = chatMessageRepository.countUnreadMessages(
                            chatroomId,
                            myMemberId,
                            myChatMember.getLastReadMessageId()
                    );

                    String myApplicationStatus = null;
                    String myApplicationPosition = null;

                    List<Object[]> results = projectApplicationRepository.findMyApplicationInfoByProjectId(projectId, myMemberId);

                    if (!results.isEmpty()) {
                        Object[] data = results.get(0);  // 첫 번째 결과 가져오기
                        myApplicationStatus = ((ApplicationStatus) data[0]).name();
                        myApplicationPosition = (String) data[1];
                    }

                    return ChatroomListDto.ChatroomItemDto.builder()
                            .chatroomId(chatroomId)
                            .projectId(projectId)
                            .projectTitle(projectTitle)
                            .otherMemberId(otherChatMember.getMemberId())
                            .otherMemberName(otherMember.getNickname())
                            .otherMemberProfileUrl(otherMember.getProfileImageUrl())
                            .lastMessage(lastMessage.map(ChatMessage::getContent).orElse(null))
                            .lastMessageAt(lastMessage.map(ChatMessage::getCreatedAt).orElse(null))
                            .unreadCount(unreadCount)
                            .isBlockedByMe(myChatMember.getIsBlocked())
                            .myApplicationStatus(myApplicationStatus)
                            .myApplicationPosition(myApplicationPosition)
                            .build();
                })
                .sorted(Comparator.comparing(
                        ChatroomListDto.ChatroomItemDto::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();

        return ChatroomListDto.builder()
                .chatrooms(chatroomItems)
                .build();
    }

    @Transactional
    public LeaveChatroomDto leaveChatroom(Integer myMemberId, Long chatroomId) {
        log.info("채팅방 나가기 요청: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        // 1. 채팅방 존재 여부 확인
        Chatroom chatroom = chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

        // 2. 내가 해당 채팅방의 멤버인지 확인
        ChatMember myChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                .filter(cm -> cm.getMemberId().equals(myMemberId))
                .findFirst()
                .orElseThrow(() -> ChatException.chatAccessDenied());

        // 3. 이미 나간 상태인지 확인
        if (myChatMember.getLeftAt() != null) {
            log.warn("이미 퇴장한 채팅방: chatroomId={}, memberId={}", chatroomId, myMemberId);
            throw ChatException.alreadyLeftChatroom();  // 변경!
        }

        // 4. 채팅방 나가기 처리
        myChatMember.leave();
        myChatMember.invalidate();
        chatMemberRepository.save(myChatMember);

        log.info("채팅방 나가기 완료: chatroomId={}, memberId={}, leftAt={}",
                chatroomId, myMemberId, myChatMember.getLeftAt());

        return LeaveChatroomDto.builder()
                .chatroomId(chatroomId)
                .leftAt(myChatMember.getLeftAt())
                .build();
    }

    @Transactional
    public BlockChatMemberDto blockChatMember(Integer myMemberId, Long chatroomId) {
        log.info("채팅 상대 차단 요청: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        // 1. 채팅방 존재 여부 확인
        Chatroom chatroom = chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

        // 2. 내가 해당 채팅방의 멤버인지 확인
        ChatMember myChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                .filter(cm -> cm.getMemberId().equals(myMemberId))
                .findFirst()
                .orElseThrow(() -> ChatException.chatAccessDenied());

        // 3. 이미 차단했는지 확인
        if (myChatMember.getIsBlocked()) {
            log.warn("이미 차단한 사용자: chatroomId={}, memberId={}", chatroomId, myMemberId);
            throw ChatException.alreadyBlocked();
        }

        // 4. 차단 처리
        myChatMember.block();
        chatMemberRepository.save(myChatMember);

        log.info("채팅 상대 차단 완료: chatroomId={}, memberId={}", chatroomId, myMemberId);

        return BlockChatMemberDto.builder()
                .chatroomId(chatroomId)
                .isBlocked(true)
                .build();
    }

    @Transactional
    public BlockChatMemberDto unblockChatMember(Integer myMemberId, Long chatroomId) {
        log.info("채팅 상대 차단 해제 요청: myMemberId={}, chatroomId={}", myMemberId, chatroomId);

        // 1. 채팅방 존재 여부 확인
        Chatroom chatroom = chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

        // 2. 내가 해당 채팅방의 멤버인지 확인
        ChatMember myChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                .filter(cm -> cm.getMemberId().equals(myMemberId))
                .findFirst()
                .orElseThrow(() -> ChatException.chatAccessDenied());

        // 3. 차단하지 않은 상태인지 확인
        if (!myChatMember.getIsBlocked()) {
            log.warn("차단되지 않은 사용자: chatroomId={}, memberId={}", chatroomId, myMemberId);
            throw ChatException.notBlocked();
        }

        // 4. 차단 해제 처리
        myChatMember.unblock();
        chatMemberRepository.save(myChatMember);

        log.info("채팅 상대 차단 해제 완료: chatroomId={}, memberId={}", chatroomId, myMemberId);

        return BlockChatMemberDto.builder()
                .chatroomId(chatroomId)
                .isBlocked(false)
                .build();
    }

    @Transactional
    public SendMessageDto sendMessage(Integer myMemberId, Long chatroomId, SendMessageRequest request) {
        log.info("메시지 전송 요청: myMemberId={}, chatroomId={}, contentLength={}, fileCount={}",
                myMemberId, chatroomId,
                request.getContent() != null ? request.getContent().length() : 0,
                request.getFiles() != null ? request.getFiles().size() : 0);

        // 0. 메시지 내용 및 파일 검증
        boolean hasContent = request.getContent() != null && !request.getContent().isBlank();
        boolean hasFiles = request.getFiles() != null && !request.getFiles().isEmpty();

        // 내용과 파일 둘 다 없으면 에러
        if (!hasContent && !hasFiles) {
            log.warn("빈 메시지 및 파일 없이 전송 시도: memberId={}, chatroomId={}", myMemberId, chatroomId);
            throw ChatException.emptyMessageAndFiles();
        }

        // 내용이 있는 경우 길이 검증
        if (hasContent && request.getContent().length() > 500) {
            log.warn("메시지 길이 초과: memberId={}, chatroomId={}, length={}",
                    myMemberId, chatroomId, request.getContent().length());
            throw ChatException.messageTooLong();
        }

        // 1. 채팅방 존재 여부 확인
        Chatroom chatroom = chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

        // 2. 내가 해당 채팅방의 참여자인지 확인
        ChatMember myChatMember = chatMemberRepository.findByChatroomIdAndMemberId(chatroomId, myMemberId)
                .orElseThrow(() -> ChatException.chatAccessDenied());

        // 3. 퇴장한 상태인지 확인
        if (myChatMember.getLeftAt() != null) {
            log.warn("퇴장한 채팅방에 메시지 전송 시도: chatroomId={}, memberId={}", chatroomId, myMemberId);
            throw ChatException.chatAccessDenied();
        }

        // 4. 상대방 찾기
        ChatMember otherChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                .filter(cm -> !cm.getMemberId().equals(myMemberId))
                .findFirst()
                .orElseThrow(() -> ChatException.chatMemberNotFound());

        // 5. 차단 상태 확인 (양방향)
        if (myChatMember.getIsBlocked() || otherChatMember.getIsBlocked()) {
            log.warn("차단된 채팅방에 메시지 전송 시도: chatroomId={}, senderId={}, myBlocked={}, otherBlocked={}",
                    chatroomId, myMemberId, myChatMember.getIsBlocked(), otherChatMember.getIsBlocked());
            throw ChatException.chatBlocked();
        }

        // 6. 파일 검증 (있는 경우) - FileValidator 사용
        int fileCount = 0;
        if (hasFiles) {
            fileCount = request.getFiles().size();
            FileValidator.validateFiles(request.getFiles(), maxFiles, maxFileSize, maxTotalSize);
            // 파일 타입 검증 (별도)
            validateFileTypes(request.getFiles());
        }

        // 7. 메시지 내용 결정
        String messageContent;
        if (hasContent) {
            // 내용이 있으면 그대로 사용
            messageContent = request.getContent();
        } else {
            // 내용이 없고 파일만 있으면 자동 생성
            messageContent = fileCount + "개의 파일을 전송했습니다.";
            log.info("파일만 전송, 자동 메시지 생성: fileCount={}", fileCount);
        }

        // 8. 메시지 저장
        ChatMessage message = ChatMessage.builder()
                .chatMemberId(myChatMember.getId())
                .content(messageContent)
                .build();
        chatMessageRepository.save(message);

        // 9. 파일 업로드 및 저장 (있는 경우)
        if (hasFiles) {
            uploadAndSaveFiles(request.getFiles(), message.getId());
        }

        // 10. 채팅방의 마지막 메시지 업데이트
        chatroom.updateLastMessage(message.getId());
        chatroomRepository.save(chatroom);

        // 11. 메시지를 보낸 사람의 lastReadMessageId 업데이트 (자동 읽음 처리)
        myChatMember.updateLastReadMessage(message.getId());
        chatMemberRepository.save(myChatMember);

        // 12. SSE로 실시간 알림
        List<Integer> participants = List.of(myMemberId, otherChatMember.getMemberId());
        participants.forEach(memberId -> {
            sseService.send(memberId, "chat_message", ChatMessageEventDto.builder()
                    .roomId(chatroomId)
                    .messageId(message.getId())
                    .build());
        });

        log.info("메시지 전송 완료: messageId={}, chatroomId={}, fileCount={}",
                message.getId(), chatroomId, fileCount);

        return SendMessageDto.builder()
                .messageId(message.getId())
                .fileCount(fileCount)
                .createdAt(message.getCreatedAt())
                .build();
    }

    /**
     * 파일 타입 검증 (별도 메서드)
     */
    private void validateFileTypes(List<MultipartFile> files) {
        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedFileType(contentType)) {
                log.warn("지원하지 않는 파일 형식: filename={}, contentType={}",
                        file.getOriginalFilename(), contentType);
                throw ChatException.unsupportedFileType();
            }
        }
    }

    /**
     * 허용된 파일 타입 체크
     */
    private boolean isAllowedFileType(String contentType) {
        // 이미지
        if (contentType.startsWith("image/")) {
            return true;
        }
        // 문서
        if (contentType.equals("application/pdf") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return true;
        }
        // 압축파일
        if (contentType.equals("application/zip") ||
                contentType.equals("application/x-zip-compressed")) {
            return true;
        }
        return false;
    }

    /**
     * 파일 업로드 및 저장
     */
    private void uploadAndSaveFiles(List<MultipartFile> files, Long messageId) {
        for (MultipartFile file : files) {
            try {
                // S3에 파일 업로드
                String fileUrl = s3Service.upload(file, "chat/files");

                // ChatMessageFile 엔티티 생성 및 저장
                ChatMessageFile messageFile = ChatMessageFile.builder()
                        .messageId(messageId)
                        .fileUrl(fileUrl)
                        .originalFileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .fileSize((int) file.getSize())
                        .build();
                chatMessageFileRepository.save(messageFile);

                log.info("파일 업로드 및 저장 완료: messageId={}, filename={}, url={}",
                        messageId, file.getOriginalFilename(), fileUrl);

            } catch (IOException e) {
                log.error("파일 업로드 실패: messageId={}, filename={}", messageId, file.getOriginalFilename(), e);
                throw ChatException.fileUploadFailed();
            }
        }
    }

    @Transactional
    public GetChatMessagesDto getChatMessages(Integer myMemberId, Long chatroomId, Long lastMessageId, Integer size) {
        log.info("채팅방 메시지 조회: myMemberId={}, chatroomId={}, lastMessageId={}, size={}",
                myMemberId, chatroomId, lastMessageId, size);

        // 1. 채팅방 존재 여부 확인
        Chatroom chatroom = chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> ChatException.chatroomNotFound(chatroomId));

        // 2. 내가 해당 채팅방의 참여자인지 확인
        ChatMember myChatMember = chatMemberRepository.findByChatroomIdAndMemberId(chatroomId, myMemberId)
                .orElseThrow(() -> ChatException.chatAccessDenied());

        // 3. 퇴장한 상태인지 확인
        if (myChatMember.getLeftAt() != null) {
            log.warn("퇴장한 채팅방 메시지 조회 시도: chatroomId={}, memberId={}", chatroomId, myMemberId);
            throw ChatException.chatAccessDenied();
        }

        // 4. 상대방 정보 조회
        ChatMember otherChatMember = chatMemberRepository.findByChatroomId(chatroomId).stream()
                .filter(cm -> !cm.getMemberId().equals(myMemberId))
                .findFirst()
                .orElseThrow(() -> ChatException.chatMemberNotFound());

        Member otherMember = memberRepository.findById(otherChatMember.getMemberId())
                .orElseThrow(() -> ChatException.memberNotFound(otherChatMember.getMemberId()));

        // 5. 메시지 조회 (size + 1개 조회하여 hasNext 판단)
        Pageable pageable = PageRequest.of(0, size + 1);
        List<ChatMessage> messages = chatMessageRepository.findByChatroomIdWithCursor(
                chatroomId, lastMessageId, pageable);

        // 6. hasNext 판단 및 실제 반환할 메시지 목록
        boolean hasNext = messages.size() > size;
        List<ChatMessage> actualMessages = hasNext ? messages.subList(0, size) : messages;

        // 7. 메시지 ID 목록 추출
        List<Long> messageIds = actualMessages.stream()
                .map(ChatMessage::getId)
                .toList();

        // 8. 파일 목록 조회 (한번에)
        List<ChatMessageFile> allFiles = messageIds.isEmpty()
                ? List.of()
                : chatMessageFileRepository.findByMessageIdInOrderByIdAsc(messageIds);

        // 9. 메시지별 파일 그룹핑
        Map<Long, List<ChatMessageFile>> filesByMessageId = allFiles.stream()
                .collect(Collectors.groupingBy(ChatMessageFile::getMessageId));

        // 10. ChatMember로 발신자 정보 조회
        List<Long> chatMemberIds = actualMessages.stream()
                .map(ChatMessage::getChatMemberId)
                .distinct()
                .toList();

        List<ChatMember> chatMembers = chatMemberRepository.findAllById(chatMemberIds);
        Map<Long, ChatMember> chatMemberMap = chatMembers.stream()
                .collect(Collectors.toMap(ChatMember::getId, cm -> cm));

        // 11. 발신자 Member 정보 조회
        List<Integer> senderIds = chatMembers.stream()
                .map(ChatMember::getMemberId)
                .distinct()
                .toList();

        List<Member> senders = memberRepository.findAllById(senderIds);
        Map<Integer, Member> senderMap = senders.stream()
                .collect(Collectors.toMap(Member::getId, m -> m));

        // 12. 메시지 DTO 변환
        List<GetChatMessagesDto.MessageDto> messageDtos = actualMessages.stream()
                .map(message -> {
                    ChatMember sender = chatMemberMap.get(message.getChatMemberId());
                    Member senderMember = senderMap.get(sender.getMemberId());

                    List<GetChatMessagesDto.FileDto> fileDtos = filesByMessageId.getOrDefault(message.getId(), List.of())
                            .stream()
                            .map(file -> GetChatMessagesDto.FileDto.builder()
                                    .fileId(file.getId())
                                    .originalFileName(file.getOriginalFileName())
                                    .fileUrl(file.getFileUrl())
                                    .fileType(file.getFileType())
                                    .fileSize(Long.valueOf(file.getFileSize()))
                                    .build())
                            .toList();

                    return GetChatMessagesDto.MessageDto.builder()
                            .messageId(message.getId())
                            .senderId(senderMember.getId())
                            .senderName(senderMember.getNickname())
                            .senderProfileUrl(senderMember.getProfileImageUrl())
                            .content(message.getContent())
                            .createdAt(message.getCreatedAt())
                            .files(fileDtos)
                            .build();
                })
                .toList();

        // 13. 읽음 처리 (마지막 메시지 ID로 업데이트)
        if (lastMessageId == null && !actualMessages.isEmpty()) {
            Long latestMessageId = actualMessages.get(0).getId(); // DESC 정렬이므로 첫번째가 최신
            myChatMember.updateLastReadMessage(latestMessageId);
            chatMemberRepository.save(myChatMember);
            log.info("읽음 처리 완료: chatroomId={}, memberId={}, lastReadMessageId={}",
                    chatroomId, myMemberId, latestMessageId);
        }

        // 14. 메시지 전송 가능 여부 판단
        boolean canSendMessage = !myChatMember.getIsBlocked() && !otherChatMember.getIsBlocked();

        // 15. 프로젝트 정보
        Integer projectId = chatroom.getProjectId();
        String projectTitle = projectRepository.findTitleById(projectId).orElse(null);

        log.info("채팅방 메시지 조회 완료: chatroomId={}, messageCount={}, hasNext={}",
                chatroomId, messageDtos.size(), hasNext);

        return GetChatMessagesDto.builder()
                .chatroomId(chatroomId)
                .projectId(projectId)
                .projectTitle(projectTitle)
                .otherMemberId(otherMember.getId())
                .otherMemberName(otherMember.getNickname())
                .otherMemberProfileUrl(otherMember.getProfileImageUrl())
                .isBlockedByMe(myChatMember.getIsBlocked())
                .isBlockedByOther(otherChatMember.getIsBlocked())
                .myLeftAt(myChatMember.getLeftAt())
                .canSendMessage(canSendMessage)
                .myLastReadMessageId(myChatMember.getLastReadMessageId())
                .otherLastReadMessageId(otherChatMember.getLastReadMessageId())
                .messages(messageDtos)
                .hasNext(hasNext)
                .build();
    }
}