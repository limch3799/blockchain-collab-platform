package com.s401.moas.member.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderMyProfileDto {
    private String profileImageUrl;
    private String chainExploreUrl;
    private String nickname;
    private String biography;

    private Integer appliedProjectCount; // 리더는 지원 개념이 없으므로 0 처리
    private Integer inProgressProjectCount;
    private Integer completedProjectCount;

    private List<String> inProgressProjectThumbnails;
    private List<String> interestedProjectThumbnails;
}


