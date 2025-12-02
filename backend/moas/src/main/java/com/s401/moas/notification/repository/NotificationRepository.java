package com.s401.moas.notification.repository;

import com.s401.moas.notification.domain.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 특정 회원의 알림 목록 조회 (최신순, 페이징)
     */
    List<Notification> findByMemberIdOrderByIdDesc(Integer memberId, Pageable pageable);

    /**
     * 특정 회원의 특정 알림 조회 (권한 체크용)
     */
    Optional<Notification> findByIdAndMemberId(Long id, Integer memberId);

    /**
     * 특정 회원의 모든 알림을 읽음 처리 (Bulk Update)
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.memberId = :memberId AND n.isRead = false")
    int markAllAsReadByMemberId(@Param("memberId") Integer memberId);

    /**
     * 특정 회원의 안 읽은 알림 개수 조회
     */
    int countByMemberIdAndIsReadFalse(Integer memberId);


}