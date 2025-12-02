package com.s401.moas.chat.repository;

import com.s401.moas.chat.domain.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // ChatMessageRepository에 추가할 메서드들

    /**
     * 특정 채팅방의 가장 최근 메시지 조회
     * chatMemberId를 통해 조회해야 하므로 @Query 사용
     */
    @Query("""
    SELECT cm 
    FROM ChatMessage cm
    WHERE cm.chatMemberId IN (
        SELECT c.id FROM ChatMember c WHERE c.chatroomId = :chatroomId
    )
    ORDER BY cm.createdAt DESC
    LIMIT 1
    """)
    Optional<ChatMessage> findFirstByChatroomId(@Param("chatroomId") Long chatroomId);

    /**
     * 특정 채팅방의 전체 메시지 개수 조회
     */
    @Query("""
    SELECT COUNT(cm)
    FROM ChatMessage cm
    WHERE cm.chatMemberId IN (
        SELECT c.id FROM ChatMember c WHERE c.chatroomId = :chatroomId
    )
    """)
    Integer countByChatroomId(@Param("chatroomId") Long chatroomId);

    /**
     * 채팅방의 메시지 목록 조회 (커서 기반 페이징)
     */
    @Query("""
    SELECT cm 
    FROM ChatMessage cm
    WHERE cm.chatMemberId IN (
        SELECT c.id FROM ChatMember c WHERE c.chatroomId = :chatroomId
    )
    AND cm.deletedAt IS NULL
    AND (:lastMessageId IS NULL OR cm.id < :lastMessageId)
    ORDER BY cm.id DESC
    """)
    List<ChatMessage> findByChatroomIdWithCursor(
            @Param("chatroomId") Long chatroomId,
            @Param("lastMessageId") Long lastMessageId,
            Pageable pageable
    );

    /**
     * ⭐ 특정 회원이 읽지 않은 메시지 개수 조회 (상대방이 보낸 메시지만)
     */
    @Query("""
SELECT COUNT(cm)
FROM ChatMessage cm
WHERE cm.chatMemberId IN (
    SELECT c.id FROM ChatMember c 
    WHERE c.chatroomId = :chatroomId 
    AND c.memberId != :myMemberId
)
AND cm.deletedAt IS NULL
AND (:lastReadMessageId IS NULL OR cm.id > :lastReadMessageId)
""")
    Integer countUnreadMessages(
            @Param("chatroomId") Long chatroomId,
            @Param("myMemberId") Integer myMemberId,
            @Param("lastReadMessageId") Long lastReadMessageId
    );
}
