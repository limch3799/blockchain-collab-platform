package com.s401.moas.contract.repository;

import com.s401.moas.admin.contract.service.dto.ContractLogDto;
import com.s401.moas.contract.domain.ActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ActionLog 엔티티에 대한 데이터 접근 리포지토리입니다.
 * NOTE: 현재는 Contract 도메인에서만 사용되어 임시로 이 패키지에 위치합니다.
 */
@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {
    Optional<ActionLog> findTopByRelatedIdAndActionTypeOrderByCreatedAtDesc(Long relatedId, String actionType);

    /**
     * 특정 계약의 모든 액션 로그 조회 (시간순 정렬)
     */
    @Query("""
    SELECT new com.s401.moas.admin.contract.service.dto.ContractLogDto(
        al.id, al.actionType, al.actorMemberId,
        m.nickname, al.details, al.createdAt
    )
    FROM ActionLog al
    LEFT JOIN Member m ON al.actorMemberId = m.id
    WHERE al.relatedId = :contractId
    ORDER BY al.createdAt DESC
    """)
    List<ContractLogDto> findContractLogs(@Param("contractId") Long contractId);

}