package com.s401.moas.contract.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.contract.service.dto.ContractDetailDto;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // null 필드는 JSON에서 제외
public class ContractDetailResponse {
    private Long contractId;
    private String title;
    private String description;
    private String leaderSignature;
    private String artistSignature;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;
    private Long totalAmount;
    private String status;
    private BigDecimal appliedFeeRate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private ProjectInfo project;
    private ParticipantInfo leader;
    private ParticipantInfo artist;
    private NftInfo nftInfo;

    // 내부 정적 클래스로 중첩 DTO 정의
    @Getter
    @Builder
    public static class ProjectInfo {
        private Integer projectId;
        private String title;
        private Long projectPositionId;
        private String positionName;
        private String categoryName;
    }

    @Getter
    @Builder
    public static class ParticipantInfo {
        private Integer userId;
        private String nickname;
    }

    @Getter
    @Builder
    public static class NftInfo {
        private String onchainStatus;
        private String tokenId;
        private String mintTxHash;
        private String explorerUrl;
    }

    // Service DTO를 Response DTO로 변환하는 정적 팩토리 메서드
    public static ContractDetailResponse from(ContractDetailDto dto) {
        ProjectInfo projectInfo = ProjectInfo.builder()
                .projectId(dto.getProjectId())
                .title(dto.getProjectTitle())
                .projectPositionId(dto.getProjectPositionId())
                .positionName(dto.getPositionName())
                .categoryName(dto.getCategoryName())
                .build();

        ParticipantInfo leaderInfo = ParticipantInfo.builder()
                .userId(dto.getLeaderId())
                .nickname(dto.getLeaderNickname())
                .build();

        ParticipantInfo artistInfo = ParticipantInfo.builder()
                .userId(dto.getArtistId())
                .nickname(dto.getArtistNickname())
                .build();

        NftInfo nftInfo = null;
        if (dto.getNftTokenId() != null || dto.getOnchainStatus() != null) {
            nftInfo = NftInfo.builder()
                    .onchainStatus(dto.getOnchainStatus())
                    .tokenId(dto.getNftTokenId())
                    .mintTxHash(dto.getNftMintTxHash())
                    .explorerUrl(dto.getNftExplorerUrl())
                    .build();
        }

        return ContractDetailResponse.builder()
                .contractId(dto.getContractId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .leaderSignature(dto.getLeaderSignature())
                .artistSignature(dto.getArtistSignature())
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .totalAmount(dto.getTotalAmount())
                .status(dto.getStatus().name())
                .appliedFeeRate(dto.getAppliedFeeRate())
                .createdAt(dto.getCreatedAt())
                .project(projectInfo)
                .leader(leaderInfo)
                .artist(artistInfo)
                .nftInfo(nftInfo)
                .build();
    }
}