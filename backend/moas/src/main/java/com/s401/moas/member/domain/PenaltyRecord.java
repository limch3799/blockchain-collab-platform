package com.s401.moas.member.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "penalty_record")
public class PenaltyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "changed_by")
    private Integer changedBy;

    @Column(name = "penalty_score", nullable = false, columnDefinition = "TINYINT")
    private Integer penaltyScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    @Builder
    public PenaltyRecord(Integer memberId, Long contractId, Integer changedBy, Integer penaltyScore) {
        this.memberId = memberId;
        this.contractId = contractId;
        this.changedBy = changedBy;
        this.penaltyScore = penaltyScore;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.changedAt = now;
    }
}