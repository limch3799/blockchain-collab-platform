package com.s401.moas.member.repository;

import com.s401.moas.member.domain.TotalPenalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TotalPenaltyRepository extends JpaRepository<TotalPenalty, Integer> {

    /**
     * 회원 ID로 페널티 점수 조회, 없으면 0점 반환
     */
    default Integer findScoreByMemberId(Integer memberId) {
        return findById(memberId)
                .map(TotalPenalty::getScore)
                .orElse(0);
    }
}