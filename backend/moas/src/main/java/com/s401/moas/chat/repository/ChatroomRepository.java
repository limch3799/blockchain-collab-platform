package com.s401.moas.chat.repository;

import com.s401.moas.chat.domain.Chatroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatroomRepository extends JpaRepository<Chatroom, Long> {

    /**
     * 특정 프로젝트에서 두 회원이 속한 채팅방 조회
     */
    @Query("""
        SELECT c
        FROM Chatroom c
        WHERE c.projectId = :projectId
        AND EXISTS (
            SELECT 1 FROM ChatMember cm1
            WHERE cm1.chatroomId = c.id AND cm1.memberId = :memberId1
        )
        AND EXISTS (
            SELECT 1 FROM ChatMember cm2
            WHERE cm2.chatroomId = c.id AND cm2.memberId = :memberId2
        )
        """)
    Optional<Chatroom> findByProjectIdAndTwoMembers(
            @Param("projectId") Integer projectId,
            @Param("memberId1") Integer memberId1,
            @Param("memberId2") Integer memberId2
    );
}