package com.s401.moas.member.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로필 수정 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMemberProfileResponse {
    private Integer memberId;
    private String nickname;
    private String biography;
    private String phoneNumber;
    private String profileImageUrl;
}
