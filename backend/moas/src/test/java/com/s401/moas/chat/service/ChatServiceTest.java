package com.s401.moas.chat.service;

import com.s401.moas.chat.controller.request.CreateChatroomRequest;
import com.s401.moas.chat.controller.request.SendMessageRequest;
import com.s401.moas.chat.domain.ChatMember;
import com.s401.moas.chat.domain.ChatMessage;
import com.s401.moas.chat.domain.ChatMessageFile;
import com.s401.moas.chat.domain.Chatroom;
import com.s401.moas.chat.exception.ChatException;
import com.s401.moas.chat.repository.ChatMemberRepository;
import com.s401.moas.chat.repository.ChatMessageFileRepository;
import com.s401.moas.chat.repository.ChatMessageRepository;
import com.s401.moas.chat.repository.ChatroomRepository;
import com.s401.moas.chat.service.dto.ChatroomListDto;
import com.s401.moas.chat.service.dto.CreateChatroomDto;
import com.s401.moas.chat.service.dto.GetChatMessagesDto;
import com.s401.moas.chat.service.dto.SendMessageDto;
import com.s401.moas.global.service.S3Service;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.OAuthProvider;
import com.s401.moas.member.repository.MemberRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@Slf4j
class ChatServiceTest {

    @Autowired
    private ChatService chatService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ChatroomRepository chatroomRepository;

    @Autowired
    private ChatMemberRepository chatMemberRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatMessageFileRepository chatMessageFileRepository;

    @MockBean  // S3Service를 Mock으로 대체
    private S3Service s3Service;

    private Member member1;
    private Member member2;
    private Integer projectId = 1; // 하드코딩

    @BeforeEach
    void setUp() throws IOException {

        // Member 생성
        member1 = Member.builder()
                .nickname("회원1")  // NOT NULL
                .provider(OAuthProvider.KAKAO)  // NOT NULL
                .providerId("provider_id_1")  // NOT NULL
                .build();
        memberRepository.save(member1);

        member2 = Member.builder()
                .nickname("회원2")
                .provider(OAuthProvider.GOOGLE)
                .providerId("provider_id_2")
                .build();
        memberRepository.save(member2);

        when(s3Service.upload(any(MultipartFile.class), anyString()))
                .thenReturn("https://mock-s3-url.com/chat/files/test-file.jpg");
    }

    @Test
    void 자기_자신과_채팅방_생성_불가() {
        // given
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member1.getId())  // 자기 자신
                .build();

        // when & then
        assertThatThrownBy(() -> chatService.createChatroom(member1.getId(), request))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 같은_프로젝트_같은_사용자_간_중복_채팅방_방지_양방향() {
        // given - A가 B에게 채팅방 생성
        CreateChatroomRequest requestAtoB = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();

        CreateChatroomDto firstChatroom = chatService.createChatroom(member1.getId(), requestAtoB);

        // when - B가 A에게 채팅방 생성 시도
        CreateChatroomRequest requestBtoA = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member1.getId())
                .build();

        CreateChatroomDto secondChatroom = chatService.createChatroom(member2.getId(), requestBtoA);

        // then - 같은 채팅방이 반환되어야 함
        assertThat(secondChatroom.getChatroomId()).isEqualTo(firstChatroom.getChatroomId());
        assertThat(secondChatroom.isNewRoom()).isFalse();
    }

    @Test
    void 차단당했고_퇴장한_상태면_채팅방_재입장_불가() {
        // given - A가 B에게 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();

        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 채팅방 퇴장
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();
        member1ChatMember.leave();
        chatMemberRepository.save(member1ChatMember);

        // B가 A를 차단 (B의 ChatMember에 isBlocked 설정)
        ChatMember member2ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member2.getId()))
                .findFirst()
                .orElseThrow();
        member2ChatMember.block();  // B가 A를 차단
        chatMemberRepository.save(member2ChatMember);

        // when & then - A가 다시 채팅방 생성 시도하면 차단 예외 발생
        assertThatThrownBy(() -> chatService.createChatroom(member1.getId(), request))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 차단당했지만_퇴장하지_않았으면_기존_채팅방_반환() {
        // given - A가 B에게 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();

        CreateChatroomDto firstChatroom = chatService.createChatroom(member1.getId(), request);

        // B가 A를 차단 (B의 ChatMember에 isBlocked 설정, A는 퇴장하지 않음)
        ChatMember member2ChatMember = chatMemberRepository
                .findByChatroomId(firstChatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member2.getId()))
                .findFirst()
                .orElseThrow();
        member2ChatMember.block();  // B가 A를 차단
        chatMemberRepository.save(member2ChatMember);

        // when - A가 다시 채팅방 생성 시도
        CreateChatroomDto secondChatroom = chatService.createChatroom(member1.getId(), request);

        // then - 기존 채팅방이 반환됨
        assertThat(secondChatroom.getChatroomId()).isEqualTo(firstChatroom.getChatroomId());
        assertThat(secondChatroom.isNewRoom()).isFalse();
    }

    @Test
    void 채팅방_목록이_마지막_메시지_시간순으로_정렬됨() {
        // given - member1이 member2, member3과 각각 채팅방 생성
        Member member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);

        // 채팅방 1: member1 <-> member2
        CreateChatroomRequest request1 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom1 = chatService.createChatroom(member1.getId(), request1);

        // 채팅방 2: member1 <-> member3
        CreateChatroomRequest request2 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member3.getId())
                .build();
        CreateChatroomDto chatroom2 = chatService.createChatroom(member1.getId(), request2);

        // 채팅방 1의 member2 ChatMember 찾기
        ChatMember chatroom1Member2 = chatMemberRepository
                .findByChatroomId(chatroom1.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member2.getId()))
                .findFirst()
                .orElseThrow();

        // 채팅방 2의 member3 ChatMember 찾기
        ChatMember chatroom2Member3 = chatMemberRepository
                .findByChatroomId(chatroom2.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member3.getId()))
                .findFirst()
                .orElseThrow();

        // 채팅방 1에 오래된 메시지 생성
        ChatMessage oldMessage = ChatMessage.builder()
                .chatMemberId(chatroom1Member2.getId())
                .content("오래된 메시지")
                .build();
        chatMessageRepository.save(oldMessage);

        // 잠시 대기 (시간 차이를 위해)
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 채팅방 2에 최신 메시지 생성
        ChatMessage newMessage = ChatMessage.builder()
                .chatMemberId(chatroom2Member3.getId())
                .content("최신 메시지")
                .build();
        chatMessageRepository.save(newMessage);

        // when
        ChatroomListDto result = chatService.getChatroomList(member1.getId());

        // then - 최신 메시지가 있는 chatroom2가 먼저 나와야 함
        assertThat(result.getChatrooms()).hasSize(2);
        assertThat(result.getChatrooms().get(0).getChatroomId()).isEqualTo(chatroom2.getChatroomId());
        assertThat(result.getChatrooms().get(1).getChatroomId()).isEqualTo(chatroom1.getChatroomId());
    }

    @Test
    void 안읽은_메시지_개수_정확히_계산됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();

        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // member2의 ChatMember 찾기
        ChatMember member2ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member2.getId()))
                .findFirst()
                .orElseThrow();

        // 메시지 3개 생성
        ChatMessage message1 = ChatMessage.builder()
                .chatMemberId(member2ChatMember.getId())
                .content("메시지 1")
                .build();
        chatMessageRepository.save(message1);

        ChatMessage message2 = ChatMessage.builder()
                .chatMemberId(member2ChatMember.getId())
                .content("메시지 2")
                .build();
        chatMessageRepository.save(message2);

        ChatMessage message3 = ChatMessage.builder()
                .chatMemberId(member2ChatMember.getId())
                .content("메시지 3")
                .build();
        chatMessageRepository.save(message3);

        // member1이 message1까지 읽음
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();
        member1ChatMember.updateLastReadMessage(message1.getId());
        chatMemberRepository.save(member1ChatMember);

        // when
        ChatroomListDto result = chatService.getChatroomList(member1.getId());

        // then - 안 읽은 메시지는 2개 (message2, message3)
        assertThat(result.getChatrooms()).hasSize(1);
        assertThat(result.getChatrooms().get(0).getUnreadCount()).isEqualTo(2);
    }

    @Test
    void 빈_채팅방_목록_조회() {
        // given - member1은 어떤 채팅방에도 참여하지 않음

        // when
        ChatroomListDto result = chatService.getChatroomList(member1.getId());

        // then
        assertThat(result.getChatrooms()).isEmpty();
    }

    @Test
    void 퇴장한_채팅방은_목록에_표시되지_않음() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();

        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 채팅방 퇴장
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();
        member1ChatMember.leave();
        chatMemberRepository.save(member1ChatMember);

        // when - A의 채팅방 목록 조회
        ChatroomListDto result = chatService.getChatroomList(member1.getId());

        // then - 목록이 비어있어야 함
        assertThat(result.getChatrooms()).isEmpty();
    }

    @Test
    void 존재하지_않는_채팅방에_메시지_전송_불가() {
        // given - 존재하지 않는 채팅방 ID
        Long nonExistentChatroomId = 99999L;
        SendMessageRequest request = new SendMessageRequest("테스트 메시지", null);

        // when & then
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), nonExistentChatroomId, request))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 내가_참여자가_아닌_채팅방에_메시지_전송_불가() {
        // given - member1과 member2의 채팅방 생성
        CreateChatroomRequest createRequest = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), createRequest);

        // member3 생성
        Member member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);

        // when & then - member3가 해당 채팅방에 메시지 전송 시도
        SendMessageRequest messageRequest = new SendMessageRequest("테스트 메시지", null);
        assertThatThrownBy(() -> chatService.sendMessage(member3.getId(), chatroom.getChatroomId(), messageRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 퇴장한_채팅방에_메시지_전송_불가() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 채팅방 퇴장
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();
        member1ChatMember.leave();
        chatMemberRepository.save(member1ChatMember);

        // when & then - A가 메시지 전송 시도
        SendMessageRequest messageRequest = new SendMessageRequest("테스트 메시지", null);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 차단한_채팅방에_메시지_전송_불가() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 B를 차단
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();
        member1ChatMember.block();
        chatMemberRepository.save(member1ChatMember);

        // when & then - B가 메시지 전송 시도
        SendMessageRequest messageRequest = new SendMessageRequest("테스트 메시지", null);
        assertThatThrownBy(() -> chatService.sendMessage(member2.getId(), chatroom.getChatroomId(), messageRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 양방향으로_서로_메시지_보내고_정확히_저장됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // ChatMember 조회
        ChatMember member1ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member1.getId()))
                .findFirst()
                .orElseThrow();

        ChatMember member2ChatMember = chatMemberRepository
                .findByChatroomId(chatroom.getChatroomId()).stream()
                .filter(cm -> cm.getMemberId().equals(member2.getId()))
                .findFirst()
                .orElseThrow();

        // when - A가 메시지 전송
        SendMessageRequest messageRequest1 = new SendMessageRequest("A의 메시지", null);
        SendMessageDto result1 = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest1);

        // B가 메시지 전송
        SendMessageRequest messageRequest2 = new SendMessageRequest("B의 메시지", null);
        SendMessageDto result2 = chatService.sendMessage(member2.getId(), chatroom.getChatroomId(), messageRequest2);

        // then - 두 메시지 모두 저장되었는지 확인
        ChatMessage savedMessage1 = chatMessageRepository.findById(result1.getMessageId()).orElseThrow();
        ChatMessage savedMessage2 = chatMessageRepository.findById(result2.getMessageId()).orElseThrow();

        assertThat(savedMessage1.getContent()).isEqualTo("A의 메시지");
        assertThat(savedMessage1.getChatMemberId()).isEqualTo(member1ChatMember.getId());

        assertThat(savedMessage2.getContent()).isEqualTo("B의 메시지");
        assertThat(savedMessage2.getChatMemberId()).isEqualTo(member2ChatMember.getId());
    }

    @Test
    void 메시지_전송_시_채팅방의_마지막_메시지_ID가_업데이트됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 초기 상태: lastMessageId는 null
        Chatroom initialChatroom = chatroomRepository.findById(chatroom.getChatroomId()).orElseThrow();
        assertThat(initialChatroom.getLastMessageId()).isNull();

        // when - A가 메시지 전송
        SendMessageRequest messageRequest = new SendMessageRequest("테스트 메시지", null);
        SendMessageDto result = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest);

        // then - 채팅방의 lastMessageId가 업데이트됨
        Chatroom updatedChatroom = chatroomRepository.findById(chatroom.getChatroomId()).orElseThrow();
        assertThat(updatedChatroom.getLastMessageId()).isEqualTo(result.getMessageId());
    }

    @Test
    void 메시지_전송_후_채팅방_목록_조회에서_마지막_메시지가_업데이트됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 초기 상태: 채팅방 목록 조회 시 마지막 메시지가 없음
        ChatroomListDto initialList = chatService.getChatroomList(member1.getId());
        assertThat(initialList.getChatrooms()).hasSize(1);
        assertThat(initialList.getChatrooms().get(0).getLastMessage()).isNull();
        assertThat(initialList.getChatrooms().get(0).getLastMessageAt()).isNull();

        // when - A가 메시지 전송
        SendMessageRequest messageRequest = new SendMessageRequest("안녕하세요, 첫 메시지입니다.", null);
        SendMessageDto sentMessage = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest);

        // then - 채팅방 목록 조회 시 마지막 메시지 정보가 업데이트됨
        ChatroomListDto updatedList = chatService.getChatroomList(member1.getId());
        assertThat(updatedList.getChatrooms()).hasSize(1);

        ChatroomListDto.ChatroomItemDto chatroomItem = updatedList.getChatrooms().get(0);
        assertThat(chatroomItem.getLastMessage()).isEqualTo("안녕하세요, 첫 메시지입니다.");
        assertThat(chatroomItem.getLastMessageAt()).isNotNull();
        assertThat(chatroomItem.getLastMessageAt()).isEqualTo(sentMessage.getCreatedAt());
    }

    @Test
    void 여러_메시지_전송_후_가장_최근_메시지가_채팅방_목록에_표시됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // when - A가 메시지 3개 전송
        SendMessageRequest message1 = new SendMessageRequest("첫 번째 메시지", null);
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), message1);

        SendMessageRequest message2 = new SendMessageRequest("두 번째 메시지", null);
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), message2);

        SendMessageRequest message3 = new SendMessageRequest("세 번째 메시지", null);
        SendMessageDto lastMessage = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), message3);

        // then - 채팅방 목록에 가장 최근 메시지(세 번째)만 표시됨
        ChatroomListDto list = chatService.getChatroomList(member1.getId());
        assertThat(list.getChatrooms()).hasSize(1);

        ChatroomListDto.ChatroomItemDto chatroomItem = list.getChatrooms().get(0);
        assertThat(chatroomItem.getLastMessage()).isEqualTo("세 번째 메시지");
        assertThat(chatroomItem.getLastMessageAt()).isEqualTo(lastMessage.getCreatedAt());
    }

    @Test
    void 여러_채팅방에서_메시지_전송_후_최신_메시지_순으로_정렬됨() {
        // given - member1이 member2, member3과 각각 채팅방 생성
        Member member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);

        // 채팅방 1: member1 <-> member2
        CreateChatroomRequest request1 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom1 = chatService.createChatroom(member1.getId(), request1);

        // 채팅방 2: member1 <-> member3
        CreateChatroomRequest request2 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member3.getId())
                .build();
        CreateChatroomDto chatroom2 = chatService.createChatroom(member1.getId(), request2);

        // when - 채팅방 1에 오래된 메시지 전송
        SendMessageRequest oldMessage = new SendMessageRequest("오래된 메시지", null);
        SendMessageDto oldMessageDto = chatService.sendMessage(member1.getId(), chatroom1.getChatroomId(), oldMessage);

        // 잠시 대기 (시간 차이를 위해)
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 채팅방 2에 최신 메시지 전송
        SendMessageRequest newMessage = new SendMessageRequest("최신 메시지", null);
        SendMessageDto newMessageDto = chatService.sendMessage(member1.getId(), chatroom2.getChatroomId(), newMessage);

        // then - 채팅방 목록이 최신 메시지 순으로 정렬됨
        ChatroomListDto list = chatService.getChatroomList(member1.getId());
        assertThat(list.getChatrooms()).hasSize(2);

        // 첫 번째는 chatroom2 (최신 메시지)
        ChatroomListDto.ChatroomItemDto firstItem = list.getChatrooms().get(0);
        assertThat(firstItem.getChatroomId()).isEqualTo(chatroom2.getChatroomId());
        assertThat(firstItem.getLastMessage()).isEqualTo("최신 메시지");
        assertThat(firstItem.getLastMessageAt()).isEqualTo(newMessageDto.getCreatedAt());

        // 두 번째는 chatroom1 (오래된 메시지)
        ChatroomListDto.ChatroomItemDto secondItem = list.getChatrooms().get(1);
        assertThat(secondItem.getChatroomId()).isEqualTo(chatroom1.getChatroomId());
        assertThat(secondItem.getLastMessage()).isEqualTo("오래된 메시지");
        assertThat(secondItem.getLastMessageAt()).isEqualTo(oldMessageDto.getCreatedAt());
    }

    @Test
    void 상대방이_메시지_전송_후_내_채팅방_목록에_반영됨() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // when - B가 메시지 전송
        SendMessageRequest messageRequest = new SendMessageRequest("B가 보낸 메시지", null);
        SendMessageDto sentMessage = chatService.sendMessage(member2.getId(), chatroom.getChatroomId(), messageRequest);

        // then - A의 채팅방 목록에도 B의 메시지가 표시됨
        ChatroomListDto memberAList = chatService.getChatroomList(member1.getId());
        assertThat(memberAList.getChatrooms()).hasSize(1);
        assertThat(memberAList.getChatrooms().get(0).getLastMessage()).isEqualTo("B가 보낸 메시지");

        // B의 채팅방 목록에도 표시됨
        ChatroomListDto memberBList = chatService.getChatroomList(member2.getId());
        assertThat(memberBList.getChatrooms()).hasSize(1);
        assertThat(memberBList.getChatrooms().get(0).getLastMessage()).isEqualTo("B가 보낸 메시지");
    }

    @Test
    void 메시지_전송_후_안읽은_메시지_개수가_증가함() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 초기 상태: 안 읽은 메시지 0개
        ChatroomListDto initialList = chatService.getChatroomList(member1.getId());
        assertThat(initialList.getChatrooms().get(0).getUnreadCount()).isEqualTo(0);

        // when - B가 메시지 3개 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 3", null));

        // then - A의 채팅방 목록에서 안 읽은 메시지 3개로 표시됨
        ChatroomListDto updatedList = chatService.getChatroomList(member1.getId());
        assertThat(updatedList.getChatrooms().get(0).getUnreadCount()).isEqualTo(3);
    }

    @Test
    void 내용과_파일_모두_없으면_전송_불가() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // when & then - 내용과 파일 모두 없이 전송 시도
        SendMessageRequest emptyRequest = new SendMessageRequest(null, null);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), emptyRequest))
                .isInstanceOf(ChatException.class);

        // 빈 문자열도 마찬가지
        SendMessageRequest blankRequest = new SendMessageRequest("", null);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), blankRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 파일만_전송_시_자동_메시지_생성됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // Mock 파일 생성
        MockMultipartFile file1 = new MockMultipartFile(
                "files", "test1.jpg", "image/jpeg", "test content 1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "files", "test2.jpg", "image/jpeg", "test content 2".getBytes());

        // when - 파일만 전송 (내용 없이)
        SendMessageRequest messageRequest = new SendMessageRequest(null, List.of(file1, file2));
        SendMessageDto result = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest);

        // then - 메시지가 자동 생성되어 저장됨
        ChatMessage savedMessage = chatMessageRepository.findById(result.getMessageId()).orElseThrow();
        assertThat(savedMessage.getContent()).isEqualTo("2개의 파일을 전송했습니다.");
        assertThat(result.getFileCount()).isEqualTo(2);

        // S3 업로드가 2번 호출되었는지 검증
        verify(s3Service, times(2)).upload(any(MultipartFile.class), eq("chat/files"));

        // ChatMessageFile이 2개 저장되었는지 확인
        List<ChatMessageFile> savedFiles = chatMessageFileRepository.findByMessageId(result.getMessageId());
        assertThat(savedFiles).hasSize(2);

        // 채팅방 목록에도 자동 생성된 메시지가 표시됨
        ChatroomListDto list = chatService.getChatroomList(member1.getId());
        assertThat(list.getChatrooms().get(0).getLastMessage()).isEqualTo("2개의 파일을 전송했습니다.");
    }

    @Test
    void 내용과_파일_모두_전송_가능() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // Mock 파일 생성
        MockMultipartFile file = new MockMultipartFile(
                "files", "test.jpg", "image/jpeg", "test content".getBytes());

        // when - 내용과 파일 모두 전송
        SendMessageRequest messageRequest = new SendMessageRequest("사진 보냅니다.", List.of(file));
        SendMessageDto result = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), messageRequest);

        // then - 입력한 내용 그대로 저장됨
        ChatMessage savedMessage = chatMessageRepository.findById(result.getMessageId()).orElseThrow();
        assertThat(savedMessage.getContent()).isEqualTo("사진 보냅니다.");
        assertThat(result.getFileCount()).isEqualTo(1);

        // S3 업로드 검증
        verify(s3Service, times(1)).upload(any(MultipartFile.class), eq("chat/files"));
    }

    @Test
    void 파일_용량_경계값_테스트() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 개별 파일 10MB - 성공
        byte[] tenMB = new byte[10 * 1024 * 1024];
        MockMultipartFile validFile = new MockMultipartFile("files", "valid.jpg", "image/jpeg", tenMB);
        SendMessageRequest validRequest = new SendMessageRequest("10MB 파일", List.of(validFile));
        assertThatCode(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), validRequest))
                .doesNotThrowAnyException();

        // 개별 파일 10MB + 1byte - 실패
        byte[] overTenMB = new byte[10 * 1024 * 1024 + 1];
        MockMultipartFile invalidFile = new MockMultipartFile("files", "invalid.jpg", "image/jpeg", overTenMB);
        SendMessageRequest invalidRequest = new SendMessageRequest("10MB 초과", List.of(invalidFile));
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), invalidRequest))
                .isInstanceOf(ChatException.class);

        // 총 용량 100MB - 성공
        List<MultipartFile> maxFiles = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            maxFiles.add(new MockMultipartFile("files", "file" + i + ".jpg", "image/jpeg", tenMB));
        }
        SendMessageRequest maxRequest = new SendMessageRequest(null, maxFiles);
        assertThatCode(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), maxRequest))
                .doesNotThrowAnyException();

        // 총 용량 100MB + 1byte - 실패
        List<MultipartFile> overMaxFiles = new ArrayList<>(maxFiles);
        overMaxFiles.add(new MockMultipartFile("files", "extra.jpg", "image/jpeg", new byte[1]));
        SendMessageRequest overMaxRequest = new SendMessageRequest(null, overMaxFiles);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), overMaxRequest))
                .isInstanceOf(ChatException.class);

        // 파일 개수 10개 - 성공
        List<MultipartFile> tenFiles = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            tenFiles.add(new MockMultipartFile("files", "file" + i + ".jpg", "image/jpeg", "content".getBytes()));
        }
        SendMessageRequest tenFilesRequest = new SendMessageRequest(null, tenFiles);
        assertThatCode(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), tenFilesRequest))
                .doesNotThrowAnyException();

        // 파일 개수 11개 - 실패
        List<MultipartFile> elevenFiles = new ArrayList<>(tenFiles);
        elevenFiles.add(new MockMultipartFile("files", "extra.jpg", "image/jpeg", "content".getBytes()));
        SendMessageRequest elevenFilesRequest = new SendMessageRequest(null, elevenFiles);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), elevenFilesRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 메시지_길이_경계값_테스트() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 500자 - 성공
        String message500 = "a".repeat(500);
        SendMessageRequest validRequest = new SendMessageRequest(message500, null);
        SendMessageDto result = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), validRequest);
        ChatMessage savedMessage = chatMessageRepository.findById(result.getMessageId()).orElseThrow();
        assertThat(savedMessage.getContent()).hasSize(500);

        // 501자 - 실패
        String message501 = "a".repeat(501);
        SendMessageRequest invalidRequest = new SendMessageRequest(message501, null);
        assertThatThrownBy(() -> chatService.sendMessage(member1.getId(), chatroom.getChatroomId(), invalidRequest))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 최신_메시지부터_조회됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 메시지 3개 전송 (시간 간격을 두고)
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("첫 번째 메시지", null));
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("두 번째 메시지", null));
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("세 번째 메시지", null));

        // when - 메시지 조회
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - 최신 메시지부터 조회됨 (세 번째 → 두 번째 → 첫 번째)
        assertThat(result.getMessages()).hasSize(3);
        assertThat(result.getMessages().get(0).getContent()).isEqualTo("세 번째 메시지");
        assertThat(result.getMessages().get(1).getContent()).isEqualTo("두 번째 메시지");
        assertThat(result.getMessages().get(2).getContent()).isEqualTo("첫 번째 메시지");
    }

    @Test
    void 페이지_크기만큼만_조회됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 메시지 5개 전송
        for (int i = 1; i <= 5; i++) {
            chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                    new SendMessageRequest("메시지 " + i, null));
        }

        // when - size=3으로 조회
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 3);

        // then - 3개만 조회됨
        assertThat(result.getMessages()).hasSize(3);
        assertThat(result.getHasNext()).isTrue();
    }

    @Test
    void 빈_채팅방_조회_시_메시지_없음() {
        // given - A가 B와 채팅방 생성 (메시지 없음)
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // when - 메시지 조회
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - 메시지 없음
        assertThat(result.getMessages()).isEmpty();
        assertThat(result.getHasNext()).isFalse();
    }

    @Test
    void lastMessageId_이전_메시지만_조회됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 메시지 5개 전송
        for (int i = 1; i <= 5; i++) {
            chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                    new SendMessageRequest("메시지 " + i, null));
        }

        // 첫 번째 조회로 최신 메시지 3개 가져오기
        GetChatMessagesDto firstResult = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 3);
        Long lastMessageId = firstResult.getMessages().get(2).getMessageId(); // 3번째 메시지의 ID

        // when - lastMessageId 이전 메시지 조회
        GetChatMessagesDto secondResult = chatService.getChatMessages(
                member1.getId(), chatroom.getChatroomId(), lastMessageId, 3);

        // then - lastMessageId보다 이전 메시지만 조회됨
        assertThat(secondResult.getMessages()).hasSize(2); // 나머지 2개
        assertThat(secondResult.getMessages().stream()
                .allMatch(msg -> msg.getMessageId() < lastMessageId)).isTrue();
    }

    @Test
    void 커서_없이_조회하면_최신_메시지부터() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 메시지 3개 전송
        SendMessageDto msg1 = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));
        SendMessageDto msg2 = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));
        SendMessageDto msg3 = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 3", null));

        // when - lastMessageId 없이 조회 (null)
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - 가장 최신 메시지(msg3)가 첫 번째
        assertThat(result.getMessages().get(0).getMessageId()).isEqualTo(msg3.getMessageId());
    }

    @Test
    void hasNext_플래그_정확히_설정됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 메시지 5개 전송
        for (int i = 1; i <= 5; i++) {
            chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                    new SendMessageRequest("메시지 " + i, null));
        }

        // when - size=3으로 조회 (전체 5개 중 3개)
        GetChatMessagesDto result1 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 3);

        // then - hasNext = true (아직 2개 남음)
        assertThat(result1.getHasNext()).isTrue();

        // when - size=10으로 조회 (전체 5개 < 10개)
        GetChatMessagesDto result2 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 10);

        // then - hasNext = false (더 이상 없음)
        assertThat(result2.getHasNext()).isFalse();
    }

    @Test
    void 메시지_조회_시_자동으로_읽음_처리됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // B가 메시지 3개 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));
        SendMessageDto lastMsg = chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 3", null));

        // when - A가 메시지 조회
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - A의 lastReadMessageId가 최신 메시지 ID로 업데이트됨
        ChatMember member1ChatMember = chatMemberRepository.findByChatroomIdAndMemberId(
                chatroom.getChatroomId(), member1.getId()).orElseThrow();
        assertThat(member1ChatMember.getLastReadMessageId()).isEqualTo(lastMsg.getMessageId());
    }


    @Test
    void 읽음_처리_후_안읽은_개수_감소함() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // B가 메시지 3개 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 3", null));

        // A의 채팅방 목록에서 안 읽은 메시지 확인 (3개)
        ChatroomListDto listBefore = chatService.getChatroomList(member1.getId());
        assertThat(listBefore.getChatrooms().get(0).getUnreadCount()).isEqualTo(3);

        // when - A가 메시지 조회 (읽음 처리)
        chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - 안 읽은 메시지 0개로 감소
        ChatroomListDto listAfter = chatService.getChatroomList(member1.getId());
        assertThat(listAfter.getChatrooms().get(0).getUnreadCount()).isEqualTo(0);
    }

    @Test
    void myLastReadMessageId가_최신_메시지로_업데이트됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // B가 메시지 전송
        SendMessageDto msg1 = chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));

        // A가 첫 번째 조회
        GetChatMessagesDto result1 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);
        assertThat(result1.getMyLastReadMessageId()).isEqualTo(msg1.getMessageId());

        // B가 추가 메시지 전송
        SendMessageDto msg2 = chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));

        // when - A가 다시 조회
        GetChatMessagesDto result2 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - myLastReadMessageId가 최신 메시지(msg2)로 업데이트됨
        assertThat(result2.getMyLastReadMessageId()).isEqualTo(msg2.getMessageId());
    }


    @Test
    void 차단_상태_정보가_정확히_반환됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 B를 차단
        ChatMember member1ChatMember = chatMemberRepository.findByChatroomIdAndMemberId(
                chatroom.getChatroomId(), member1.getId()).orElseThrow();
        member1ChatMember.block();
        chatMemberRepository.save(member1ChatMember);

        // when - A가 메시지 조회
        GetChatMessagesDto result = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - 차단 상태 정보가 정확히 반환됨
        assertThat(result.getIsBlockedByMe()).isTrue();
        assertThat(result.getIsBlockedByOther()).isFalse();
    }

    @Test
    void canSendMessage_플래그가_올바르게_계산됨() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 차단 없는 상태 - canSendMessage = true
        GetChatMessagesDto result1 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);
        assertThat(result1.getCanSendMessage()).isTrue();

        // A가 B를 차단
        ChatMember member1ChatMember = chatMemberRepository.findByChatroomIdAndMemberId(
                chatroom.getChatroomId(), member1.getId()).orElseThrow();
        member1ChatMember.block();
        chatMemberRepository.save(member1ChatMember);

        // when - A가 메시지 조회
        GetChatMessagesDto result2 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // then - canSendMessage = false (차단 상태)
        assertThat(result2.getCanSendMessage()).isFalse();
    }

    @Test
    void 퇴장한_채팅방_메시지_조회_불가() {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 채팅방 퇴장
        chatService.leaveChatroom(member1.getId(), chatroom.getChatroomId());

        // when & then - A가 메시지 조회 시도하면 예외 발생
        assertThatThrownBy(() -> chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 참여자가_아닌_채팅방_메시지_조회_불가() {
        // given - member1과 member2의 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // member3 생성
        Member member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);

        // when & then - member3가 해당 채팅방 메시지 조회 시도하면 예외 발생
        assertThatThrownBy(() -> chatService.getChatMessages(member3.getId(), chatroom.getChatroomId(), null, 20))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 존재하지_않는_채팅방_메시지_조회_불가() {
        // given - 존재하지 않는 채팅방 ID
        Long nonExistentChatroomId = 99999L;

        // when & then - 메시지 조회 시도하면 예외 발생
        assertThatThrownBy(() -> chatService.getChatMessages(member1.getId(), nonExistentChatroomId, null, 20))
                .isInstanceOf(ChatException.class);
    }

    @Test
    void 채팅방_생성부터_메시지_조회까지_전체_플로우() throws IOException {
        // 1. A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);
        assertThat(chatroom.getChatroomId()).isNotNull();

        // 2. A가 메시지 전송
        SendMessageDto sentMsg = chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("안녕하세요", null));
        assertThat(sentMsg.getMessageId()).isNotNull();

        // 3. B가 메시지 조회
        GetChatMessagesDto result = chatService.getChatMessages(member2.getId(), chatroom.getChatroomId(), null, 20);

        // 검증
        assertThat(result.getChatroomId()).isEqualTo(chatroom.getChatroomId());
        assertThat(result.getMessages()).hasSize(1);
        assertThat(result.getMessages().get(0).getContent()).isEqualTo("안녕하세요");
        assertThat(result.getMessages().get(0).getSenderId()).isEqualTo(member1.getId());
    }

    @Test
    void 양방향_메시지_주고받기_후_각자_조회() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // A가 메시지 전송
        chatService.sendMessage(member1.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("A의 메시지", null));

        // B가 메시지 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("B의 메시지", null));

        // when - A가 조회
        GetChatMessagesDto resultA = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);

        // when - B가 조회
        GetChatMessagesDto resultB = chatService.getChatMessages(member2.getId(), chatroom.getChatroomId(), null, 20);

        // then - 둘 다 2개 메시지 조회됨
        assertThat(resultA.getMessages()).hasSize(2);
        assertThat(resultB.getMessages()).hasSize(2);

        // A 입장에서 본 상대방은 B
        assertThat(resultA.getOtherMemberId()).isEqualTo(member2.getId());
        assertThat(resultA.getOtherMemberName()).isEqualTo(member2.getNickname());

        // B 입장에서 본 상대방은 A
        assertThat(resultB.getOtherMemberId()).isEqualTo(member1.getId());
        assertThat(resultB.getOtherMemberName()).isEqualTo(member1.getNickname());
    }

    @Test
    void 메시지_전송_조회_읽음_상태_변화_추적() throws IOException {
        // given - A가 B와 채팅방 생성
        CreateChatroomRequest request = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom = chatService.createChatroom(member1.getId(), request);

        // 1. B가 메시지 3개 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 1", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 2", null));
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 3", null));

        // 2. A의 채팅방 목록 확인 - 안 읽은 메시지 3개
        ChatroomListDto list1 = chatService.getChatroomList(member1.getId());
        assertThat(list1.getChatrooms().get(0).getUnreadCount()).isEqualTo(3);

        // 3. A가 메시지 조회 (읽음 처리)
        GetChatMessagesDto messages1 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);
        assertThat(messages1.getMessages()).hasSize(3);
        Long lastReadId = messages1.getMyLastReadMessageId();

        // 4. A의 채팅방 목록 재확인 - 안 읽은 메시지 0개
        ChatroomListDto list2 = chatService.getChatroomList(member1.getId());
        assertThat(list2.getChatrooms().get(0).getUnreadCount()).isEqualTo(0);

        // 5. B가 추가 메시지 전송
        chatService.sendMessage(member2.getId(), chatroom.getChatroomId(),
                new SendMessageRequest("메시지 4", null));

        // 6. A의 채팅방 목록 재확인 - 안 읽은 메시지 1개
        ChatroomListDto list3 = chatService.getChatroomList(member1.getId());
        assertThat(list3.getChatrooms().get(0).getUnreadCount()).isEqualTo(1);

        // 7. A가 다시 조회 - 4개 메시지 모두 읽음
        GetChatMessagesDto messages2 = chatService.getChatMessages(member1.getId(), chatroom.getChatroomId(), null, 20);
        assertThat(messages2.getMessages()).hasSize(4);
        assertThat(messages2.getMyLastReadMessageId()).isGreaterThan(lastReadId);

        // 8. A의 채팅방 목록 최종 확인 - 안 읽은 메시지 0개
        ChatroomListDto list4 = chatService.getChatroomList(member1.getId());
        assertThat(list4.getChatrooms().get(0).getUnreadCount()).isEqualTo(0);
    }

    @Test
    void 여러_채팅방_복합_시나리오_전체_플로우_검증() throws IOException, InterruptedException {
        // ============= 준비: 회원 3명 생성 =============
        Member member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);

        // ============= 1단계: 3개의 채팅방 생성 =============
        // member1 <-> member2 (채팅방1)
        CreateChatroomRequest request1 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member2.getId())
                .build();
        CreateChatroomDto chatroom1 = chatService.createChatroom(member1.getId(), request1);

        // member1 <-> member3 (채팅방2)
        CreateChatroomRequest request2 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member3.getId())
                .build();
        CreateChatroomDto chatroom2 = chatService.createChatroom(member1.getId(), request2);

        // member2 <-> member3 (채팅방3)
        CreateChatroomRequest request3 = CreateChatroomRequest.builder()
                .projectId(projectId)
                .otherMemberId(member3.getId())
                .build();
        CreateChatroomDto chatroom3 = chatService.createChatroom(member2.getId(), request3);

        log.info("=== 3개 채팅방 생성 완료 ===");
        log.info("채팅방1: {} (member1 <-> member2)", chatroom1.getChatroomId());
        log.info("채팅방2: {} (member1 <-> member3)", chatroom2.getChatroomId());
        log.info("채팅방3: {} (member2 <-> member3)", chatroom3.getChatroomId());

        // ============= 2단계: 채팅방1에서 메시지 주고받기 (6개) =============
        SendMessageDto msg1_1 = chatService.sendMessage(member1.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member1 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg1_2 = chatService.sendMessage(member2.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member2 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg1_3 = chatService.sendMessage(member1.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member1 메시지2", null));
        Thread.sleep(10);

        SendMessageDto msg1_4 = chatService.sendMessage(member2.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member2 메시지2", null));
        Thread.sleep(10);

        SendMessageDto msg1_5 = chatService.sendMessage(member1.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member1 메시지3", null));

        SendMessageDto msg1_6 = chatService.sendMessage(member2.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member2 메시지3", null));
        Thread.sleep(10);

        log.info("=== 채팅방1: 메시지 6개 전송 완료 ===");

        // 채팅방1의 lastMessageId 확인
        Chatroom room1 = chatroomRepository.findById(chatroom1.getChatroomId()).orElseThrow();
        assertThat(room1.getLastMessageId()).isEqualTo(msg1_6.getMessageId());

        // ============= 3단계: 채팅방2에서 메시지 주고받기 (3개) =============
        SendMessageDto msg2_1 = chatService.sendMessage(member1.getId(), chatroom2.getChatroomId(),
                new SendMessageRequest("채팅방2: member1 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg2_2 = chatService.sendMessage(member3.getId(), chatroom2.getChatroomId(),
                new SendMessageRequest("채팅방2: member3 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg2_3 = chatService.sendMessage(member1.getId(), chatroom2.getChatroomId(),
                new SendMessageRequest("채팅방2: member1 메시지2", null));

        log.info("=== 채팅방2: 메시지 3개 전송 완료 ===");

        // 채팅방2의 lastMessageId 확인
        Chatroom room2 = chatroomRepository.findById(chatroom2.getChatroomId()).orElseThrow();
        assertThat(room2.getLastMessageId()).isEqualTo(msg2_3.getMessageId());

        // ============= 4단계: 채팅방3에서 메시지 주고받기 (4개) =============
        SendMessageDto msg3_1 = chatService.sendMessage(member2.getId(), chatroom3.getChatroomId(),
                new SendMessageRequest("채팅방3: member2 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg3_2 = chatService.sendMessage(member3.getId(), chatroom3.getChatroomId(),
                new SendMessageRequest("채팅방3: member3 메시지1", null));
        Thread.sleep(10);

        SendMessageDto msg3_3 = chatService.sendMessage(member2.getId(), chatroom3.getChatroomId(),
                new SendMessageRequest("채팅방3: member2 메시지2", null));
        Thread.sleep(10);

        SendMessageDto msg3_4 = chatService.sendMessage(member3.getId(), chatroom3.getChatroomId(),
                new SendMessageRequest("채팅방3: member3 메시지2", null));

        log.info("=== 채팅방3: 메시지 4개 전송 완료 ===");

        // 채팅방3의 lastMessageId 확인
        Chatroom room3 = chatroomRepository.findById(chatroom3.getChatroomId()).orElseThrow();
        assertThat(room3.getLastMessageId()).isEqualTo(msg3_4.getMessageId());

        // ============= 5단계: member1 채팅방 목록 조회 (읽지 않은 상태) =============
        ChatroomListDto member1List1 = chatService.getChatroomList(member1.getId());

        log.info("=== member1 채팅방 목록 조회 (읽기 전) ===");
        assertThat(member1List1.getChatrooms().size()).isEqualTo(2);

        // 채팅방 정렬 확인 (lastMessageAt 최신순)
        assertThat(member1List1.getChatrooms().get(0).getChatroomId()).isEqualTo(chatroom2.getChatroomId()); // 채팅방2가 최신
        assertThat(member1List1.getChatrooms().get(1).getChatroomId()).isEqualTo(chatroom1.getChatroomId());

        // 안 읽은 메시지 개수 확인
        // 채팅방1: member2가 보낸 메시지 2개 (msg1_2, msg1_4)
        // 채팅방2: member3가 보낸 메시지 1개 (msg2_2)
        ChatroomListDto.ChatroomItemDto room1Item = member1List1.getChatrooms().stream()
                .filter(c -> c.getChatroomId().equals(chatroom1.getChatroomId()))
                .findFirst().orElseThrow();
        assertThat(room1Item.getUnreadCount()).isEqualTo(1);

        ChatroomListDto.ChatroomItemDto room2Item = member1List1.getChatrooms().stream()
                .filter(c -> c.getChatroomId().equals(chatroom2.getChatroomId()))
                .findFirst().orElseThrow();
        assertThat(room2Item.getUnreadCount()).isEqualTo(0);

        // ============= 6단계: member1이 채팅방1 메시지 조회 (읽음 처리) =============
        GetChatMessagesDto room1Messages = chatService.getChatMessages(
                member1.getId(), chatroom1.getChatroomId(), null, 20);

        log.info("=== member1이 채팅방1 메시지 조회 ===");
        assertThat(room1Messages.getMessages()).hasSize(6);
        assertThat(room1Messages.getMyLastReadMessageId()).isEqualTo(msg1_6.getMessageId());

        // member1의 lastReadMessageId 확인
        ChatMember member1Room1 = chatMemberRepository.findByChatroomIdAndMemberId(
                chatroom1.getChatroomId(), member1.getId()).orElseThrow();
        assertThat(member1Room1.getLastReadMessageId()).isEqualTo(msg1_6.getMessageId());

        // ============= 7단계: member1 채팅방 목록 재조회 (채팅방1 읽음 처리 반영) =============
        ChatroomListDto member1List2 = chatService.getChatroomList(member1.getId());

        log.info("=== member1 채팅방 목록 재조회 (채팅방1 읽은 후) ===");
        ChatroomListDto.ChatroomItemDto room1ItemAfter = member1List2.getChatrooms().stream()
                .filter(c -> c.getChatroomId().equals(chatroom1.getChatroomId()))
                .findFirst().orElseThrow();
        assertThat(room1ItemAfter.getUnreadCount()).isEqualTo(0); // 모두 읽음

        // ============= 8단계: member2가 채팅방1에 메시지 추가 전송 =============
        SendMessageDto msg1_7 = chatService.sendMessage(member2.getId(), chatroom1.getChatroomId(),
                new SendMessageRequest("채팅방1: member2 메시지4", null));

        log.info("=== member2가 채팅방1에 추가 메시지 전송 ===");

        // ============= 9단계: member1 채팅방 목록 재조회 (새 메시지 확인) =============
        ChatroomListDto member1List3 = chatService.getChatroomList(member1.getId());

        log.info("=== member1 채팅방 목록 재조회 (새 메시지 도착 후) ===");
        // 채팅방 정렬 변경 확인 (채팅방1이 최신 메시지로 맨 위로)
        assertThat(member1List3.getChatrooms().get(0).getChatroomId()).isEqualTo(chatroom1.getChatroomId());

        // 안 읽은 메시지 1개 증가
        ChatroomListDto.ChatroomItemDto room1ItemNew = member1List3.getChatrooms().get(0);
        assertThat(room1ItemNew.getUnreadCount()).isEqualTo(1);
        assertThat(room1ItemNew.getLastMessage()).isEqualTo("채팅방1: member2 메시지4");

        // ============= 10단계: member2의 관점 확인 =============
        ChatroomListDto member2List = chatService.getChatroomList(member2.getId());

        log.info("=== member2 채팅방 목록 조회 ===");
        assertThat(member2List.getChatrooms()).hasSize(2); // 채팅방1, 채팅방3

        // member2는 채팅방1에서 member1의 메시지를 아직 읽지 않음
        ChatroomListDto.ChatroomItemDto member2Room1 = member2List.getChatrooms().stream()
                .filter(c -> c.getChatroomId().equals(chatroom1.getChatroomId()))
                .findFirst().orElseThrow();
        assertThat(member2Room1.getUnreadCount()).isEqualTo(0); // member1이 보낸 메시지 3개지만 전송할 때 이미 앞의 메시지를 다 읽음

        // ============= 11단계: member2가 채팅방1 메시지 조회 =============
        GetChatMessagesDto member2Room1Messages = chatService.getChatMessages(
                member2.getId(), chatroom1.getChatroomId(), null, 20);

        log.info("=== member2가 채팅방1 메시지 조회 ===");
        assertThat(member2Room1Messages.getMessages()).hasSize(7); // 총 7개 메시지
        assertThat(member2Room1Messages.getMyLastReadMessageId()).isEqualTo(msg1_7.getMessageId());
        assertThat(member2Room1Messages.getOtherLastReadMessageId()).isEqualTo(msg1_6.getMessageId()); // member1은 msg1_5까지 읽음

        // ============= 12단계: 파일 첨부 메시지 전송 (채팅방2) =============
        MockMultipartFile file1 = new MockMultipartFile(
                "files", "test1.jpg", "image/jpeg", "test content 1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "files", "test2.pdf", "application/pdf", "test content 2".getBytes());

        SendMessageDto msg2_4 = chatService.sendMessage(member3.getId(), chatroom2.getChatroomId(),
                new SendMessageRequest("채팅방2: 파일 첨부 메시지", List.of(file1, file2)));

        log.info("=== 채팅방2: 파일 첨부 메시지 전송 ===");
        assertThat(msg2_4.getFileCount()).isEqualTo(2);

        // ============= 13단계: member1이 채팅방2 메시지 조회하여 파일 확인 =============
        GetChatMessagesDto room2Messages = chatService.getChatMessages(
                member1.getId(), chatroom2.getChatroomId(), null, 20);

        log.info("=== member1이 채팅방2 메시지 조회 (파일 포함) ===");
        assertThat(room2Messages.getMessages()).hasSize(4);

        // 파일 첨부 메시지 확인
        GetChatMessagesDto.MessageDto fileMessage = room2Messages.getMessages().stream()
                .filter(m -> m.getMessageId().equals(msg2_4.getMessageId()))
                .findFirst().orElseThrow();
        assertThat(fileMessage.getFiles()).hasSize(2);
        assertThat(fileMessage.getContent()).isEqualTo("채팅방2: 파일 첨부 메시지");

        // ============= 14단계: 전체 상태 최종 검증 =============
        log.info("=== 전체 상태 최종 검증 ===");

        // member1 최종 상태
        ChatroomListDto finalMember1List = chatService.getChatroomList(member1.getId());
        assertThat(finalMember1List.getChatrooms()).hasSize(2);

        // 채팅방 정렬 확인 (채팅방2가 최신)
        assertThat(finalMember1List.getChatrooms().get(0).getChatroomId()).isEqualTo(chatroom2.getChatroomId());

        // member2 최종 상태
        ChatroomListDto finalMember2List = chatService.getChatroomList(member2.getId());
        assertThat(finalMember2List.getChatrooms()).hasSize(2);

        // member3 최종 상태
        ChatroomListDto finalMember3List = chatService.getChatroomList(member3.getId());
        assertThat(finalMember3List.getChatrooms()).hasSize(2);

        // 각 채팅방의 lastMessageId 최종 확인
        Chatroom finalRoom1 = chatroomRepository.findById(chatroom1.getChatroomId()).orElseThrow();
        Chatroom finalRoom2 = chatroomRepository.findById(chatroom2.getChatroomId()).orElseThrow();
        Chatroom finalRoom3 = chatroomRepository.findById(chatroom3.getChatroomId()).orElseThrow();

        assertThat(finalRoom1.getLastMessageId()).isEqualTo(msg1_7.getMessageId());
        assertThat(finalRoom2.getLastMessageId()).isEqualTo(msg2_4.getMessageId());
        assertThat(finalRoom3.getLastMessageId()).isEqualTo(msg3_4.getMessageId());

        // 각 채팅방의 총 메시지 개수 확인
        List<ChatMessage> room1AllMessages = chatMessageRepository.findAll().stream()
                .filter(m -> {
                    ChatMember cm = chatMemberRepository.findById(m.getChatMemberId()).orElse(null);
                    return cm != null && cm.getChatroomId().equals(chatroom1.getChatroomId());
                })
                .toList();
        assertThat(room1AllMessages).hasSize(7);

        List<ChatMessage> room2AllMessages = chatMessageRepository.findAll().stream()
                .filter(m -> {
                    ChatMember cm = chatMemberRepository.findById(m.getChatMemberId()).orElse(null);
                    return cm != null && cm.getChatroomId().equals(chatroom2.getChatroomId());
                })
                .toList();
        assertThat(room2AllMessages).hasSize(4);

        List<ChatMessage> room3AllMessages = chatMessageRepository.findAll().stream()
                .filter(m -> {
                    ChatMember cm = chatMemberRepository.findById(m.getChatMemberId()).orElse(null);
                    return cm != null && cm.getChatroomId().equals(chatroom3.getChatroomId());
                })
                .toList();
        assertThat(room3AllMessages).hasSize(4);

        log.info("=== ✅ 전체 플로우 검증 완료 ===");
        log.info("채팅방1: 7개 메시지, lastMessageId={}", finalRoom1.getLastMessageId());
        log.info("채팅방2: 4개 메시지, lastMessageId={}, 파일 포함", finalRoom2.getLastMessageId());
        log.info("채팅방3: 4개 메시지, lastMessageId={}", finalRoom3.getLastMessageId());
    }

}