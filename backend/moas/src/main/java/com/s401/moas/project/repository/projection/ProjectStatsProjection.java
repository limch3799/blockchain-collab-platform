package com.s401.moas.project.repository.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatsProjection {
    private Long recruitingCount;
    private Long closedCount;
    private Long deletedCount;
    private Long totalCount;
}