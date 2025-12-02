package com.s401.moas.admin.feepolicy.repository;

import com.s401.moas.admin.feepolicy.domain.FeePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FeePolicyRepository extends JpaRepository<FeePolicy, Integer> {

    /**
     * 전체 수수료 정책 이력 조회 (최신순)
     */
    List<FeePolicy> findAllByOrderByStartAtDesc();

    /**
     * 미래 정책 조회 (start_at > 현재 시각)
     */
    @Query("SELECT fp FROM FeePolicy fp WHERE fp.startAt > :now ORDER BY fp.startAt ASC")
    Optional<FeePolicy> findFuturePolicy(LocalDateTime now);

    /**
     * 현재 적용 중인 수수료율 조회
     * 정책이 없으면 기본값(5.0%) 반환
     */
    @Query("SELECT COALESCE(fp.feeRate, 5.0) FROM FeePolicy fp WHERE fp.startAt <= :now ORDER BY fp.startAt DESC LIMIT 1")
    Optional<BigDecimal> findCurrentFeeRate(LocalDateTime now);
}