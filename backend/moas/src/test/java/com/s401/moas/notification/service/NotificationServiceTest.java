package com.s401.moas.notification.service;

import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.OAuthProvider;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.notification.domain.Notification;
import com.s401.moas.notification.exception.NotificationException;
import com.s401.moas.notification.repository.NotificationRepository;
import com.s401.moas.notification.service.dto.NotificationListDto;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@Slf4j
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MemberRepository memberRepository;

    private Member member1;
    private Member member2;
    private Member member3;

    @BeforeEach
    void setUp() {
        // Member 생성
        member1 = Member.builder()
                .nickname("회원1")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_1")
                .build();
        memberRepository.save(member1);

        member2 = Member.builder()
                .nickname("회원2")
                .provider(OAuthProvider.GOOGLE)
                .providerId("provider_id_2")
                .build();
        memberRepository.save(member2);

        member3 = Member.builder()
                .nickname("회원3")
                .provider(OAuthProvider.KAKAO)
                .providerId("provider_id_3")
                .build();
        memberRepository.save(member3);
    }

    // ============================================
    // 1. 알림 생성 테스트
    // ============================================

    @Test
    void 알림_생성_성공() {
        // when
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 100L);

        // then
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).getAlarmType()).isEqualTo("APPLICATION_RECEIVED");
        assertThat(notifications.get(0).getRelatedId()).isEqualTo(100L);
    }

    @Test
    void 알림_생성_시_기본값_확인() {
        // when
        notificationService.createNotification(member1.getId(), "CONTRACT_OFFERED", 200L);

        // then
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Notification notification = notifications.get(0);
        assertThat(notification.getIsRead()).isFalse();
        assertThat(notification.getCreatedAt()).isNotNull();
    }

    // ============================================
    // 2. 알림 목록 조회 테스트
    // ============================================

    @Test
    void 빈_알림_목록_조회() {
        // when
        NotificationListDto result = notificationService.getNotifications(member1.getId(), 0, 20);

        // then
        assertThat(result.getNotifications()).isEmpty();
    }

    @Test
    void 알림_목록이_최신순으로_정렬됨() {
        // given
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        notificationService.createNotification(member1.getId(), "CONTRACT_OFFERED", 2L);
        notificationService.createNotification(member1.getId(), "PAYMENT_COMPLETED", 3L);

        // when
        NotificationListDto result = notificationService.getNotifications(member1.getId(), 0, 20);

        // then
        assertThat(result.getNotifications()).hasSize(3);
        assertThat(result.getNotifications().get(0).getAlarmType()).isEqualTo("PAYMENT_COMPLETED");
        assertThat(result.getNotifications().get(1).getAlarmType()).isEqualTo("CONTRACT_OFFERED");
        assertThat(result.getNotifications().get(2).getAlarmType()).isEqualTo("APPLICATION_RECEIVED");
    }

    @Test
    void 페이징_적용_확인() {
        // given - 알림 5개 생성
        for (int i = 1; i <= 5; i++) {
            notificationService.createNotification(member1.getId(), "TYPE_" + i, (long) i);
        }

        // when - size=3으로 조회
        NotificationListDto result = notificationService.getNotifications(member1.getId(), 0, 3);

        // then - 3개만 조회됨
        assertThat(result.getNotifications()).hasSize(3);
    }

    @Test
    void 다른_회원의_알림은_조회되지_않음() {
        // given
        notificationService.createNotification(member1.getId(), "TYPE_1", 1L);
        notificationService.createNotification(member2.getId(), "TYPE_2", 2L);

        // when
        NotificationListDto result = notificationService.getNotifications(member1.getId(), 0, 20);

        // then - member1의 알림만 조회됨
        assertThat(result.getNotifications()).hasSize(1);
        assertThat(result.getNotifications().get(0).getAlarmType()).isEqualTo("TYPE_1");
    }

    // ============================================
    // 3. 알림 읽음 처리 테스트
    // ============================================

    @Test
    void 알림_읽음_처리_성공() {
        // given
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();

        // when
        notificationService.markAsRead(member1.getId(), notificationId);

        // then
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        assertThat(notification.getIsRead()).isTrue();
    }

    @Test
    void 이미_읽은_알림도_다시_읽음_처리_가능() {
        // given
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();
        notificationService.markAsRead(member1.getId(), notificationId);

        // when - 다시 읽음 처리
        assertThatCode(() -> notificationService.markAsRead(member1.getId(), notificationId))
                .doesNotThrowAnyException();

        // then
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        assertThat(notification.getIsRead()).isTrue();
    }

    @Test
    void 존재하지_않는_알림_읽음_처리_시_예외_발생() {
        // given
        Long nonExistentId = 99999L;

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(member1.getId(), nonExistentId))
                .isInstanceOf(NotificationException.class);
    }

    @Test
    void 다른_회원의_알림_읽음_처리_시_예외_발생() {
        // given - member1의 알림 생성
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();

        // when & then - member2가 member1의 알림 읽음 처리 시도
        assertThatThrownBy(() -> notificationService.markAsRead(member2.getId(), notificationId))
                .isInstanceOf(NotificationException.class);
    }

    // ============================================
    // 4. 전체 알림 읽음 처리 테스트
    // ============================================

    @Test
    void 전체_알림_읽음_처리_성공() {
        // given - 알림 3개 생성
        notificationService.createNotification(member1.getId(), "TYPE_1", 1L);
        notificationService.createNotification(member1.getId(), "TYPE_2", 2L);
        notificationService.createNotification(member1.getId(), "TYPE_3", 3L);

        // when
        notificationService.markAllAsRead(member1.getId());

        // then - 모든 알림이 읽음 처리됨
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(notifications).hasSize(3);
        assertThat(notifications).allMatch(Notification::getIsRead);
    }

    @Test
    void 안_읽은_알림만_읽음_처리됨() {
        // given - 알림 3개 생성 후 1개만 읽음 처리
        notificationService.createNotification(member1.getId(), "TYPE_1", 1L);
        notificationService.createNotification(member1.getId(), "TYPE_2", 2L);
        notificationService.createNotification(member1.getId(), "TYPE_3", 3L);

        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        notificationService.markAsRead(member1.getId(), notifications.get(0).getId());

        // when - 전체 읽음 처리
        notificationService.markAllAsRead(member1.getId());

        // then - 모든 알림이 읽음 처리됨
        notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(notifications).allMatch(Notification::getIsRead);
    }

    @Test
    void 다른_회원의_알림은_읽음_처리되지_않음() {
        // given
        notificationService.createNotification(member1.getId(), "TYPE_1", 1L);
        notificationService.createNotification(member2.getId(), "TYPE_2", 2L);

        // when - member1의 전체 읽음 처리
        notificationService.markAllAsRead(member1.getId());

        // then - member2의 알림은 읽지 않은 상태
        List<Notification> member2Notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member2.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(member2Notifications.get(0).getIsRead()).isFalse();
    }

    @Test
    void 읽을_알림이_없어도_예외_없이_처리됨() {
        // when & then - 알림이 없어도 예외 발생하지 않음
        assertThatCode(() -> notificationService.markAllAsRead(member1.getId()))
                .doesNotThrowAnyException();
    }

    // ============================================
    // 5. 알림 삭제 테스트
    // ============================================

    @Test
    void 알림_삭제_성공() {
        // given
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();

        // when
        notificationService.deleteNotification(member1.getId(), notificationId);

        // then
        assertThat(notificationRepository.findById(notificationId)).isEmpty();
    }

    @Test
    void 존재하지_않는_알림_삭제_시_예외_발생() {
        // given
        Long nonExistentId = 99999L;

        // when & then
        assertThatThrownBy(() -> notificationService.deleteNotification(member1.getId(), nonExistentId))
                .isInstanceOf(NotificationException.class);
    }

    @Test
    void 다른_회원의_알림_삭제_시_예외_발생() {
        // given - member1의 알림 생성
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 1L);
        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();

        // when & then - member2가 member1의 알림 삭제 시도
        assertThatThrownBy(() -> notificationService.deleteNotification(member2.getId(), notificationId))
                .isInstanceOf(NotificationException.class);
    }

    @Test
    void 삭제_후_조회되지_않음_확인() {
        // given - 알림 2개 생성
        notificationService.createNotification(member1.getId(), "TYPE_1", 1L);
        notificationService.createNotification(member1.getId(), "TYPE_2", 2L);

        List<Notification> notifications = notificationRepository.findByMemberIdOrderByIdDesc(
                member1.getId(), org.springframework.data.domain.PageRequest.of(0, 10));
        Long notificationId = notifications.get(0).getId();

        // when - 1개 삭제
        notificationService.deleteNotification(member1.getId(), notificationId);

        // then - 1개만 조회됨
        NotificationListDto result = notificationService.getNotifications(member1.getId(), 0, 20);
        assertThat(result.getNotifications()).hasSize(1);
    }

    // ============================================
    // 6. 통합 플로우 테스트
    // ============================================

    @Test
    void 여러_회원_복합_시나리오_전체_플로우() throws InterruptedException {
        log.info("=== 통합 플로우 테스트 시작 ===");

        // ============= 1단계: 알림 생성 (다양한 타입) =============
        log.info("=== 1단계: 알림 생성 ===");

        // member1에게 알림 3개
        notificationService.createNotification(member1.getId(), "APPLICATION_RECEIVED", 101L);
        Thread.sleep(10);
        notificationService.createNotification(member1.getId(), "CONTRACT_OFFERED", 102L);
        Thread.sleep(10);
        notificationService.createNotification(member1.getId(), "PAYMENT_COMPLETED", 103L);

        // member2에게 알림 2개
        notificationService.createNotification(member2.getId(), "APPLICATION_RECEIVED", 201L);
        Thread.sleep(10);
        notificationService.createNotification(member2.getId(), "CONTRACT_ACCEPTED", 202L);

        // member3에게 알림 1개
        notificationService.createNotification(member3.getId(), "PAYMENT_COMPLETED", 301L);

        log.info("알림 생성 완료: member1=3개, member2=2개, member3=1개");

        // ============= 2단계: member1의 알림 목록 조회 =============
        log.info("=== 2단계: member1 알림 목록 조회 ===");

        NotificationListDto member1List1 = notificationService.getNotifications(member1.getId(), 0, 20);

        assertThat(member1List1.getNotifications()).hasSize(3);
        assertThat(member1List1.getNotifications()).allMatch(n -> !n.getIsRead());
        assertThat(member1List1.getNotifications().get(0).getAlarmType()).isEqualTo("PAYMENT_COMPLETED");
        assertThat(member1List1.getNotifications().get(1).getAlarmType()).isEqualTo("CONTRACT_OFFERED");
        assertThat(member1List1.getNotifications().get(2).getAlarmType()).isEqualTo("APPLICATION_RECEIVED");

        log.info("member1 알림 목록 조회 완료: 3개, 모두 읽지 않음");

        // ============= 3단계: member1이 첫 번째 알림 읽음 처리 =============
        log.info("=== 3단계: member1 첫 번째 알림 읽음 처리 ===");

        Long firstNotificationId = member1List1.getNotifications().get(0).getNotificationId();
        notificationService.markAsRead(member1.getId(), firstNotificationId);

        Notification firstNotification = notificationRepository.findById(firstNotificationId).orElseThrow();
        assertThat(firstNotification.getIsRead()).isTrue();

        log.info("첫 번째 알림 읽음 처리 완료: notificationId={}", firstNotificationId);

        // ============= 4단계: member1에게 새 알림 2개 추가 생성 =============
        log.info("=== 4단계: member1에게 새 알림 추가 ===");

        Thread.sleep(10);
        notificationService.createNotification(member1.getId(), "CONTRACT_DECLINED", 104L);
        Thread.sleep(10);
        notificationService.createNotification(member1.getId(), "APPLICATION_REJECTED", 105L);

        log.info("member1에게 새 알림 2개 추가 완료");

        // ============= 5단계: member1의 알림 목록 재조회 (페이징 size=3) =============
        log.info("=== 5단계: member1 알림 목록 재조회 (size=3) ===");

        NotificationListDto member1List2 = notificationService.getNotifications(member1.getId(), 0, 3);

        assertThat(member1List2.getNotifications()).hasSize(3);
        // 최신 2개는 읽지 않음
        assertThat(member1List2.getNotifications().get(0).getIsRead()).isFalse();
        assertThat(member1List2.getNotifications().get(1).getIsRead()).isFalse();

        log.info("member1 알림 목록 재조회 완료: 3개 (최신 2개는 읽지 않음)");

        // ============= 6단계: member1이 전체 읽음 처리 =============
        log.info("=== 6단계: member1 전체 읽음 처리 ===");

        notificationService.markAllAsRead(member1.getId());

        NotificationListDto member1List3 = notificationService.getNotifications(member1.getId(), 0, 20);
        assertThat(member1List3.getNotifications()).hasSize(5);
        assertThat(member1List3.getNotifications()).allMatch(NotificationListDto.NotificationItemDto::getIsRead);

        log.info("member1 전체 읽음 처리 완료: 5개 모두 읽음");

        // ============= 7단계: member2의 알림 목록 조회 =============
        log.info("=== 7단계: member2 알림 목록 조회 ===");

        NotificationListDto member2List1 = notificationService.getNotifications(member2.getId(), 0, 20);

        assertThat(member2List1.getNotifications()).hasSize(2);
        assertThat(member2List1.getNotifications()).allMatch(n -> !n.getIsRead());
        assertThat(member2List1.getNotifications().get(0).getAlarmType()).isEqualTo("CONTRACT_ACCEPTED");

        log.info("member2 알림 목록 조회 완료: 2개 (member1 알림은 조회 안됨)");

        // ============= 8단계: member1이 자신의 알림 1개 삭제 =============
        log.info("=== 8단계: member1 알림 삭제 ===");

        Long deleteTargetId = member1List3.getNotifications().get(0).getNotificationId();
        notificationService.deleteNotification(member1.getId(), deleteTargetId);

        NotificationListDto member1List4 = notificationService.getNotifications(member1.getId(), 0, 20);
        assertThat(member1List4.getNotifications()).hasSize(4);

        log.info("member1 알림 삭제 완료: 남은 알림 4개");

        // ============= 9단계: member1이 member2의 알림 삭제 시도 =============
        log.info("=== 9단계: member1이 member2 알림 삭제 시도 (실패 예상) ===");

        Long member2NotificationId = member2List1.getNotifications().get(0).getNotificationId();
        assertThatThrownBy(() -> notificationService.deleteNotification(member1.getId(), member2NotificationId))
                .isInstanceOf(NotificationException.class);

        log.info("권한 없음 예외 발생 확인");

        // ============= 10단계: member3의 알림 목록 조회 =============
        log.info("=== 10단계: member3 알림 목록 조회 ===");

        NotificationListDto member3List = notificationService.getNotifications(member3.getId(), 0, 20);

        assertThat(member3List.getNotifications()).hasSize(1);
        assertThat(member3List.getNotifications().get(0).getAlarmType()).isEqualTo("PAYMENT_COMPLETED");
        assertThat(member3List.getNotifications().get(0).getRelatedId()).isEqualTo(301L);

        log.info("member3 알림 목록 조회 완료: 1개");

        // ============= 11단계: 최종 검증 =============
        log.info("=== 11단계: 최종 검증 ===");

        // 각 회원별 알림 개수
        NotificationListDto finalMember1List = notificationService.getNotifications(member1.getId(), 0, 100);
        NotificationListDto finalMember2List = notificationService.getNotifications(member2.getId(), 0, 100);
        NotificationListDto finalMember3List = notificationService.getNotifications(member3.getId(), 0, 100);

        assertThat(finalMember1List.getNotifications()).hasSize(4);  // 5개 생성 - 1개 삭제
        assertThat(finalMember2List.getNotifications()).hasSize(2);
        assertThat(finalMember3List.getNotifications()).hasSize(1);

        // member1의 알림은 모두 읽음 상태
        assertThat(finalMember1List.getNotifications()).allMatch(NotificationListDto.NotificationItemDto::getIsRead);

        // member2, member3의 알림은 읽지 않음 상태
        assertThat(finalMember2List.getNotifications()).allMatch(n -> !n.getIsRead());
        assertThat(finalMember3List.getNotifications()).allMatch(n -> !n.getIsRead());

        log.info("=== ✅ 전체 플로우 검증 완료 ===");
        log.info("최종 상태: member1=4개(모두 읽음), member2=2개(읽지 않음), member3=1개(읽지 않음)");
    }
}