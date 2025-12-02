package com.s401.moas.member.repository;

import com.s401.moas.member.domain.PenaltyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRecordRepository extends JpaRepository<PenaltyRecord, Long> {

    /**
     * 특정 회원의 페널티 이력 조회 (최신순)
     */
    List<PenaltyRecord> findByMemberIdOrderByCreatedAtDesc(Integer memberId);
}