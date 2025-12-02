package com.s401.moas.admin.feepolicy.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_policy")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FeePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "fee_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal feeRate;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public FeePolicy(Integer createdBy, BigDecimal feeRate, LocalDateTime startAt) {
        this.createdBy = createdBy;
        this.feeRate = feeRate;
        this.startAt = startAt;
    }

    /**
     * 수수료율 업데이트 (미래 정책만 가능)
     */
    public void updateFeeRate(BigDecimal newFeeRate, LocalDateTime newStartAt) {
        this.feeRate = newFeeRate;
        this.startAt = newStartAt;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 미래 정책인지 확인
     */
    public boolean isFuturePolicy() {
        return this.startAt.isAfter(LocalDateTime.now());
    }
}