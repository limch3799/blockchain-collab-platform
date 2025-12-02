package com.s401.moas.admin.member.repository.projection;

import com.s401.moas.member.domain.MemberRole;
import lombok.Getter;

/**
 * 역할별 회원 수 Projection DTO
 * Spring Data JPA가 자동으로 매핑해줍니다.
 */
@Getter
public class MemberRoleCountProjection {
    private final MemberRole role;
    private final Long count;

    public MemberRoleCountProjection(MemberRole role, Long count) {
        this.role = role;
        this.count = count != null ? count : 0L;
    }
}