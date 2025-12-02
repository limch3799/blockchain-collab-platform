package com.s401.moas.member.controller.request;

import com.s401.moas.member.domain.MemberRole;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 역할 변경 요청 DTO
 */
@Getter
@NoArgsConstructor
public class UpdateMemberRoleRequest {

    @NotNull(message = "역할은 필수입니다. (LEADER 또는 ARTIST)")
    private MemberRole role;
}
