package com.s401.moas.blockchain.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "onchain_record")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OnchainRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long contractId;

    @Setter
    @Column(length = 66) // tx_hash는 성공 시에만 채워지므로 nullable
    private String txHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OnchainStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public OnchainRecord(Long contractId, ActionType actionType, OnchainStatus status) {
        this.contractId = contractId;
        this.actionType = actionType;
        this.status = status;
    }

    //== 비즈니스 로직 (상태 변경) ==//

    public void setSucceeded(String txHash) {
        if (this.status != OnchainStatus.PENDING) {
            // 이미 처리된 요청에 대한 중복 업데이트를 방지
            throw new IllegalStateException("이미 처리된 온체인 기록입니다.");
        }
        this.txHash = txHash;
        this.status = OnchainStatus.SUCCEEDED;
    }

    public void setFailed() {
        if (this.status != OnchainStatus.PENDING) {
            // 이미 처리된 요청에 대한 중복 업데이트를 방지
            throw new IllegalStateException("이미 처리된 온체인 기록입니다.");
        }
        this.status = OnchainStatus.FAILED;
    }
}