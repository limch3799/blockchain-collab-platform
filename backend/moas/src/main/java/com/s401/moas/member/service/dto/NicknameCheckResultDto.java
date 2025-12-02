package com.s401.moas.member.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 닉네임 중복 체크 결과 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NicknameCheckResultDto {
    private String nickname;
    private boolean available; // true: 사용 가능, false: 중복됨 (사용 불가)
}

