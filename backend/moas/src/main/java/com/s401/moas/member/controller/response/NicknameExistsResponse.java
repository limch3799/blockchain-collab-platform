package com.s401.moas.member.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 닉네임 중복 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NicknameExistsResponse {
    private Boolean available; // 닉네임 사용 가능 여부 (true: 사용 가능, false: 중복됨)
    private String nickname; // 조회한 닉네임
}

