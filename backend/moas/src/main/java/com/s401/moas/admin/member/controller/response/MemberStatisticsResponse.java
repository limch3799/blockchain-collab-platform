package com.s401.moas.admin.member.controller.response;

import com.s401.moas.admin.member.service.dto.MemberStatisticsDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
@Schema(description = "회원 통계 응답")
public class MemberStatisticsResponse {

    @Schema(description = "전체 회원 수", example = "1500")
    private Long totalMembers;

    @Schema(description = "역할별 회원 수 분포")
    private RoleDistribution roleDistribution;

    @Getter
    @Builder
    @Schema(description = "역할별 회원 수")
    public static class RoleDistribution {

        @Schema(description = "PENDING 역할 회원 수", example = "50")
        private Long pending;

        @Schema(description = "LEADER 역할 회원 수", example = "600")
        private Long leader;

        @Schema(description = "ARTIST 역할 회원 수", example = "850")
        private Long artist;
    }

    public static MemberStatisticsResponse from(MemberStatisticsDto dto) {
        return MemberStatisticsResponse.builder()
                .totalMembers(dto.getTotalMembers())
                .roleDistribution(RoleDistribution.builder()
                        .pending(dto.getRoleDistribution().getOrDefault("PENDING", 0L))
                        .leader(dto.getRoleDistribution().getOrDefault("LEADER", 0L))
                        .artist(dto.getRoleDistribution().getOrDefault("ARTIST", 0L))
                        .build())
                .build();
    }
}