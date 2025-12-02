package com.s401.moas.admin.contract.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.s401.moas.contract.domain.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ContractListDto {
    private Long contractId;
    private String title;

    private Integer projectId;
    private String projectTitle;

    private Integer leaderId;
    private String leaderNickname;

    private Integer artistId;
    private String artistNickname;

    private Long totalAmount;
    private ContractStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // 생성자에서 null 처리 추가
    public ContractListDto(
            Long contractId, String title,
            Integer projectId, String projectTitle,
            Integer leaderId, String leaderNickname,
            Integer artistId, String artistNickname,
            Long totalAmount, ContractStatus status,
            LocalDateTime startAt, LocalDateTime endAt, LocalDateTime createdAt
    ) {
        this.contractId = contractId;
        this.title = title;
        this.projectId = projectId;
        this.projectTitle = projectTitle != null ? projectTitle : "(삭제된 프로젝트)";
        this.leaderId = leaderId;
        this.leaderNickname = leaderNickname != null ? leaderNickname : "(탈퇴한 회원)";
        this.artistId = artistId;
        this.artistNickname = artistNickname != null ? artistNickname : "(탈퇴한 회원)";
        this.totalAmount = totalAmount;
        this.status = status;
        this.startAt = startAt;
        this.endAt = endAt;
        this.createdAt = createdAt;
    }
}