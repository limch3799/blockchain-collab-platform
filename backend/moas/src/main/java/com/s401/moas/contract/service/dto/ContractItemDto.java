package com.s401.moas.contract.service.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder(toBuilder = true)
public class ContractItemDto {
    private final Long contractId;
    private final String title;
    private final Long totalAmount;
    private final String status;
    private final LocalDateTime startAt;
    private final LocalDateTime endAt;
    private final LocalDateTime createdAt;
    private final ProjectInfo project;
    private final ParticipantInfo leader;
    private final ParticipantInfo artist;
    private final NftInfo nftInfo;

    public ContractItemDto(
            Long contractId, String title, LocalDateTime startAt, LocalDateTime endAt, Long totalAmount, String status, LocalDateTime createdAt,
            Integer projectId, String projectTitle, String positionName, String categoryName,
            Integer leaderId, String leaderNickname,
            Integer artistId, String artistNickname
    ) {
        this.contractId = contractId;
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;

        this.project = ProjectInfo.builder()
                .projectId(projectId)
                .title(projectTitle)
                .positionName(positionName)
                .categoryName(categoryName)
                .build();

        this.leader = ParticipantInfo.builder()
                .userId(leaderId)
                .nickname(leaderNickname)
                .build();

        this.artist = ParticipantInfo.builder()
                .userId(artistId)
                .nickname(artistNickname)
                .build();

        this.nftInfo = null; // 초기에는 null
    }

    // Builder가 모든 필드를 사용하도록 전체 필드 생성자 추가
    @Builder
    public ContractItemDto(Long contractId, String title, Long totalAmount, String status, LocalDateTime startAt, LocalDateTime endAt, LocalDateTime createdAt, ProjectInfo project, ParticipantInfo leader, ParticipantInfo artist, NftInfo nftInfo) {
        this.contractId = contractId;
        this.title = title;
        this.totalAmount = totalAmount;
        this.status = status;
        this.startAt = startAt;
        this.endAt = endAt;
        this.createdAt = createdAt;
        this.project = project;
        this.leader = leader;
        this.artist = artist;
        this.nftInfo = nftInfo;
    }

    // --- 내부 DTO 정의 ---
    @Getter @Builder
    public static class ProjectInfo {
        private final Integer projectId;
        private final String title;
        private final String positionName;
        private final String categoryName;
    }

    @Getter @Builder
    public static class ParticipantInfo {
        private final Integer userId;
        private final String nickname;
    }

    @Getter @Builder
    public static class NftInfo {
        private final String onchainStatus;
        private final String tokenId;
        private final String explorerUrl;
    }
}