package com.s401.moas.member.controller.response;

import com.s401.moas.member.service.dto.ArtistMyProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 아티스트 마이페이지 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistMyProfileResponse {
    // Member 엔티티 기반 정보
    private String profileImageUrl; // 썸네일(프로필 이미지)
    private String chainExploreUrl;
    private String nickname;
    private String biography;

    // 프로젝트 집계 정보
    private Integer appliedProjectCount;   // 지원한 프로젝트 수
    private Integer inProgressProjectCount; // 진행 중 프로젝트 수
    private Integer completedProjectCount; // 완료한 프로젝트 수

    // 프로젝트 썸네일 목록 (최대 3개 노출 가정)
    private List<String> inProgressProjectThumbnails;   // 진행 중 프로젝트 썸네일
    private List<String> interestedProjectThumbnails;   // 관심 있는 프로젝트 썸네일

    public static ArtistMyProfileResponse from(ArtistMyProfileDto dto) {
        return ArtistMyProfileResponse.builder()
                .profileImageUrl(dto.getProfileImageUrl())
                .chainExploreUrl(dto.getChainExplorerUrl())
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


