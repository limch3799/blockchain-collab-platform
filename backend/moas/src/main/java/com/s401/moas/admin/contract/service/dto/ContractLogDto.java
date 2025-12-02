package com.s401.moas.admin.contract.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ContractLogDto {
    private Long logId;
    private String actionType;
    private Integer actorMemberId;
    private String actorNickname;
    private String details;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}