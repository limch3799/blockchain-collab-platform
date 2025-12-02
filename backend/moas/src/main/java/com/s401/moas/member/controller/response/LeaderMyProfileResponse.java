package com.s401.moas.member.controller.response;

import com.s401.moas.member.service.dto.LeaderMyProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderMyProfileResponse {
    private String profileImageUrl;
    private String chainExploreUrl;
    private String nickname;
    private String biography;

    private Integer appliedProjectCount;
    private Integer inProgressProjectCount;
    private Integer completedProjectCount;

    private List<String> inProgressProjectThumbnails;
    private List<String> interestedProjectThumbnails;

    public static LeaderMyProfileResponse from(LeaderMyProfileDto dto) {
        return LeaderMyProfileResponse.builder()
                .profileImageUrl(dto.getProfileImageUrl())
                .chainExploreUrl(dto.getChainExploreUrl())
                .nickname(dto.getNickname())
                .biography(dto.getBiography())
                .appliedProjectCount(dto.getAppliedProjectCount())
                .inProgressProjectCount(dto.getInProgressProjectCount())
                .completedProjectCount(dto.getCompletedProjectCount())
                .inProgressProjectThumbnails(dto.getInProgressProjectThumbnails())
                .interestedProjectThumbnails(dto.getInterestedProjectThumbnails())
                .build();
    }
}


