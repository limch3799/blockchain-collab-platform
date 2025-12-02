package com.s401.moas.member.controller.response;

import com.s401.moas.member.domain.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 공개 프로필 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberPublicProfileResponse {
    private Integer memberId;
    private String nickname;
    private String profileImageUrl;
    private String chainExploreUrl;
    private String role; // "LEADER" 또는 "ARTIST"
    private Double averageRating; // 평균 평점 (0.0 ~ 5.0)
    private Integer reviewCount; // 리뷰 개수
}

