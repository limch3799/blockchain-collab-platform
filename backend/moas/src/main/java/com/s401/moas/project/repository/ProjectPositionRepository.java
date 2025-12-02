package com.s401.moas.project.repository;

import com.s401.moas.application.controller.response.ApplicantListResponse;
import com.s401.moas.project.domain.ProjectPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPositionRepository extends JpaRepository<ProjectPosition, Long> {
    /**
     * 삭제되지 않은 포지션 조회
     */
    Optional<ProjectPosition> findByIdAndDeletedAtIsNull(Long id);

    /**
     * 프로젝트의 삭제되지 않은 포지션 목록 조회
     */
    List<ProjectPosition> findByProjectIdAndDeletedAtIsNull(Integer projectId);

    /**
     * 특정 프로젝트의 모든 포지션 정보를 DTO로 조회합니다.
     * (ApplicationService에서 사용할 DTO 프로젝션)
     * - project_position (pp): id (projectPositionId), budget
     * - position (p): position_name, category_id
     * - category (c): category_name (가정)
     */
    @Query(value = """
    SELECT
        c.category_name AS categoryName,
        p.position_name AS positionName,
        pp.id AS projectPositionId,
        CAST(pp.budget AS SIGNED) AS budget,
        pp.status AS positionStatus
    FROM
        project_position pp
    JOIN
        position p ON pp.position_id = p.id
    JOIN
        category c ON p.category_id = c.id
    WHERE
        pp.project_id = :projectId
        AND pp.deleted_at IS NULL
    """, nativeQuery = true)
    List<ApplicantListResponse.ProjectPositionInfo> findProjectPositionsForDto(@Param("projectId") Integer projectId);
}
