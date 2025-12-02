package com.s401.moas.blockchain.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "contract_nft",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_nft_contract_owner",
                columnNames = {"contractId", "ownerMemberId"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContractNft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 온체인의 tokenId와 동일한 값
    @Column(nullable = false)
    private Long contractId;

    @Column(nullable = false, length = 66)
    private String mintTxHash;

    @Column(nullable = false)
    private Integer ownerMemberId;

    @Column(nullable = false)
    private Byte quantity;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    @Builder
    public ContractNft(Long contractId, String mintTxHash, Integer ownerMemberId) {
        this.contractId = contractId;
        this.mintTxHash = mintTxHash;
        this.ownerMemberId = ownerMemberId;
        this.quantity = 1; // 기본값 1
    }

    public void burn() {
        if (this.deletedAt != null) {
            throw new IllegalStateException("이미 소각된 NFT입니다.");
        }
        this.deletedAt = LocalDateTime.now();
    }
}