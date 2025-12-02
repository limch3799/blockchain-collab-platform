package com.s401.moas.chat.repository;

import com.s401.moas.chat.domain.ChatMessageFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageFileRepository extends JpaRepository<ChatMessageFile, Long> {
    List<ChatMessageFile> findByMessageId(Long messageId);

    /**
     * 여러 메시지의 파일 목록 조회
     */
    List<ChatMessageFile> findByMessageIdInOrderByIdAsc(List<Long> messageIds);

}
