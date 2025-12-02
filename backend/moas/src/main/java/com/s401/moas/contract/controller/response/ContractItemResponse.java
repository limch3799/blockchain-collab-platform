package com.s401.moas.contract.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.s401.moas.contract.service.dto.ContractItemDto;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContractItemResponse {
    private final Long contractId;
    private final String title;
    private final Long totalAmount;
    private final String status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime startAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime endAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;
    private final ProjectInfo project;
    private final ParticipantInfo leader;
    private final ParticipantInfo artist;
    private final NftInfo nftInfo;

    public static ContractItemResponse from(ContractItemDto dto) {
        return ContractItemResponse.builder()
                .contractId(dto.getContractId())
                .title(dto.getTitle())
                .totalAmount(dto.getTotalAmount())
                .status(dto.getStatus())
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .createdAt(dto.getCreatedAt())
                .project(ProjectInfo.from(dto.getProject()))
                .leader(ParticipantInfo.from(dto.getLeader()))
                .artist(ParticipantInfo.from(dto.getArtist()))
                .nftInfo(dto.getNftInfo() != null ? NftInfo.from(dto.getNftInfo()) : null)
                .build();
    }

    @Getter @Builder
    public static class ProjectInfo {
        private final Integer projectId;
        private final String title;
        private final String positionName;
        private final String categoryName;

        public static ProjectInfo from(ContractItemDto.ProjectInfo dto) {
            return new ProjectInfo(dto.getProjectId(), dto.getTitle(), dto.getPositionName(), dto.getCategoryName());
        }
    }

    @Getter @Builder
    public static class ParticipantInfo {
        private final Integer userId;
        private final String nickname;

        public static ParticipantInfo from(ContractItemDto.ParticipantInfo dto) {
            return new ParticipantInfo(dto.getUserId(), dto.getNickname());
        }
    }

    @Getter @Builder
    public static class NftInfo {
        private final String onchainStatus;
        private final String tokenId;
        private final String explorerUrl;

        public static NftInfo from(ContractItemDto.NftInfo dto) {
            return new NftInfo(dto.getOnchainStatus(), dto.getTokenId(), dto.getExplorerUrl());
        }
    }
}