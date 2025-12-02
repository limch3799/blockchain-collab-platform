package com.s401.moas.contract.service.dto;

import com.s401.moas.contract.domain.ContractStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Builder(toBuilder = true)
public class ContractDetailDto {
    // Contract 정보
    private Long contractId;
    private String title;
    private String description;
    private String leaderSignature;
    private String artistSignature;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Long totalAmount;
    private ContractStatus status;
    private BigDecimal appliedFeeRate;
    private LocalDateTime createdAt;

    // Project 정보
    private Integer projectId;
    private String projectTitle;

    // Leader 정보
    private Integer leaderId;
    private String leaderNickname;

    // Artist 정보
    private Integer artistId;
    private String artistNickname;

    private Long projectPositionId;
    private String positionName;
    private String categoryName;

    // NFT 정보 (Nullable)
    private String onchainStatus;
    private String nftTokenId;
    private String nftMintTxHash;
    private String nftExplorerUrl;

    public ContractDetailDto(
            Long contractId, String title, String description,
            String leaderSignature, String artistSignature,
            LocalDateTime startAt, LocalDateTime endAt, Long totalAmount,
            ContractStatus status, BigDecimal appliedFeeRate, LocalDateTime createdAt,
            Integer projectId, String projectTitle,
            Integer leaderId, String leaderNickname,
            Integer artistId, String artistNickname,
            Long projectPositionId, String positionName, String categoryName,
            String onchainStatus, String nftTokenId, String nftMintTxHash, String nftExplorerUrl
    ) {
        this.contractId = contractId;
        this.title = title;
        this.description = description;
        this.leaderSignature = leaderSignature;
        this.artistSignature = artistSignature;
        this.startAt = startAt;
        this.endAt = endAt;
        this.totalAmount = totalAmount;
        this.status = status;
        this.appliedFeeRate = appliedFeeRate;
        this.createdAt = createdAt;
        this.projectId = projectId;
        this.projectTitle = projectTitle != null ? projectTitle : "(삭제된 프로젝트)";
        this.leaderId = leaderId;
        this.leaderNickname = leaderNickname != null ? leaderNickname : "(삭제된 회원)";
        this.artistId = artistId;
        this.artistNickname = artistNickname != null ? artistNickname : "(삭제된 회원)";
        this.projectPositionId = projectPositionId;
        this.positionName = positionName;
        this.categoryName = categoryName;
        this.onchainStatus = onchainStatus;
        this.nftTokenId = nftTokenId;
        this.nftMintTxHash = nftMintTxHash;
        this.nftExplorerUrl = nftExplorerUrl;
    }
}