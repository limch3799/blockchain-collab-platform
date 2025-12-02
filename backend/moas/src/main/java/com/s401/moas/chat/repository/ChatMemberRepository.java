package com.s401.moas.chat.repository;

import com.s401.moas.chat.domain.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {

    /**
     * 채팅방의 모든 멤버 조회 (퇴장 여부 무관)
     */
    List<ChatMember> findByChatroomId(Long chatroomId);

    /**
     * 채팅방 ID와 회원 ID로 멤버 조회
     */
    Optional<ChatMember> findByChatroomIdAndMemberId(Long chatroomId, Integer memberId);

    /**
     * 특정 회원이 참여 중인 채팅방 멤버 조회 (퇴장하지 않은 것만)
     */
    List<ChatMember> findByMemberIdAndLeftAtIsNull(Integer memberId);
}