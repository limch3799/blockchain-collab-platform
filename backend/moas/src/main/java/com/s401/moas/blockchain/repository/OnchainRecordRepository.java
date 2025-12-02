package com.s401.moas.blockchain.repository;

import com.s401.moas.blockchain.domain.ActionType;
import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.domain.OnchainStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OnchainRecordRepository extends JpaRepository<OnchainRecord, Long> {
    boolean existsByContractIdAndActionTypeAndStatus(Long id, ActionType actionType, OnchainStatus onchainStatus);

    // 특정 계약 ID, 액션 타입, 상태에 맞는 레코드를 찾는 메소드
    Optional<OnchainRecord> findByContractIdAndActionTypeAndStatus(Long contractId, ActionType actionType, OnchainStatus status);

    Optional<OnchainRecord> findTopByContractIdAndActionTypeOrderByIdDesc(Long contractId, ActionType actionType);

    List<OnchainRecord> findByContractIdInAndActionType(List<Long> contractIds, ActionType actionType);

    /**
     * 특정 상태와 특정 시간 이전에 생성된 레코드 목록을 조회합니다.
     * 데이터 보정 배치에서 사용됩니다.
     */
    List<OnchainRecord> findByStatusAndCreatedAtBefore(OnchainStatus status, LocalDateTime dateTime);

    /**
     * FAILED 상태인 모든 작업을 페이징하여 조회합니다. (updatedAt 기준 내림차순)
     */
    Page<OnchainRecord> findByStatusOrderByUpdatedAtDesc(OnchainStatus status, Pageable pageable);

    /**
     * 특정 ActionType이면서 FAILED 상태인 모든 작업을 페이징하여 조회합니다. (updatedAt 기준 내림차순)
     */
    Page<OnchainRecord> findByStatusAndActionTypeOrderByUpdatedAtDesc(OnchainStatus status, ActionType actionType, Pageable pageable);

    /**
     * 특정 contractId에 해당하는 모든 온체인 기록을 최신순으로 조회합니다.
     */
    List<OnchainRecord> findByContractIdOrderByIdDesc(Long contractId);
}