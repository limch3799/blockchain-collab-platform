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
public class ArtistMyProfileDto {
    private String profileImageUrl;
    private String chainExplorerUrl;
    private String nickname;
    private String biography;

    private Integer appliedProjectCount;
    private Integer inProgressProjectCount;
    private Integer completedProjectCount;

    private List<String> inProgressProjectThumbnails;
    private List<String> interestedProjectThumbnails;
}


