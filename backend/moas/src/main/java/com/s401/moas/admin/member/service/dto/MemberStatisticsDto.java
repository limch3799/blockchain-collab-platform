package com.s401.moas.admin.member.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class MemberStatisticsDto {

    private Long totalMembers;
    private Map<String, Long> roleDistribution;
}