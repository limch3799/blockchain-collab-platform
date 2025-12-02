package com.s401.moas.project.repository;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.s401.moas.project.repository.projection.ProjectStatsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.s401.moas.project.domain.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

    /**
     * 프로젝트 목록 조회용 DTO 인터페이스
     * 네이티브 쿼리에서 반환되는 java.sql.Timestamp를 사용
     */
    interface ProjectRow {
        Integer getId();

        String getTitle();

        String getSummary();

        String getThumbnailUrl();

        String getProvinceCode();

        String getProvince();

        String getDistrictCode();

        String getDistrict();

        Timestamp getStartAt();

        Timestamp getEndAt();

        Timestamp getApplyDeadline();

        Long getTotalBudget();

        Long getViewCount();

        Timestamp getCreatedAt();

        Timestamp getUpdatedAt();

        String getLeaderNickname();

        String getLeaderProfileImageUrl();

        /**
         * 북마크 여부 (네이티브 쿼리에서 0 또는 1로 반환됨)
         * MySQL의 CASE WHEN ... THEN FALSE ELSE ... END는 숫자로 반환됨
         */
        Long getBookmarked();

        Timestamp getClosedAt();
    }

    /**
     * 북마크한 프로젝트 개수 조회
     */
    @Query(value = """
            SELECT COUNT(DISTINCT r.id)
            FROM project r
            INNER JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            WHERE r.deleted_at IS NULL
            AND r.closed_at IS NULL
            AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL) OR
                 (:status = 'closed' AND r.closed_at IS NOT NULL))
            """, nativeQuery = true)
    long countBookmarkedProjects(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status);

    /**
     * 필터링된 프로젝트 개수 조회
     */
    @Query(value = """
            SELECT COUNT(DISTINCT r.id)
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            WHERE r.deleted_at IS NULL
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND ((:status IS NULL OR :status = '') AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
                 OR (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW()))
                 OR (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            """, nativeQuery = true)
    long countAllWithFilters(
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status);

    /**
     * 프로젝트 목록 조회 (정렬: created)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                CASE WHEN :memberId IS NULL THEN FALSE
                     ELSE (MAX(CASE WHEN pb.member_id IS NULL THEN 0 ELSE 1 END) = 1)
                END AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND ((:status IS NULL OR :status = '') AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
                 OR (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW()))
                 OR (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findProjectsCreated(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 프로젝트 목록 조회 (정렬: views)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                CASE WHEN :memberId IS NULL THEN FALSE
                     ELSE (MAX(CASE WHEN pb.member_id IS NULL THEN 0 ELSE 1 END) = 1)
                END AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND ((:status IS NULL OR :status = '') AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
                 OR (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW()))
                 OR (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.view_count DESC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findProjectsViews(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 프로젝트 목록 조회 (정렬: start)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                CASE WHEN :memberId IS NULL THEN FALSE
                     ELSE (MAX(CASE WHEN pb.member_id IS NULL THEN 0 ELSE 1 END) = 1)
                END AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND ((:status IS NULL OR :status = '') AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
                 OR (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW()))
                 OR (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.start_at ASC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findProjectsStart(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 프로젝트 목록 조회 (정렬: amount)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                CASE WHEN :memberId IS NULL THEN FALSE
                     ELSE (MAX(CASE WHEN pb.member_id IS NULL THEN 0 ELSE 1 END) = 1)
                END AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND ((:status IS NULL OR :status = '') AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
                 OR (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW()))
                 OR (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY total_budget DESC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findProjectsAmount(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 프로젝트별 포지션 정보 조회
     */
    @Query(value = """
            SELECT r.id AS project_id, c.category_name, pos.position_name, pp.budget
            FROM project r
            JOIN project_position pp ON pp.project_id = r.id
            JOIN position pos ON pos.id = pp.position_id
            JOIN category c ON c.id = pos.category_id
            WHERE r.id IN (:ids)
            """, nativeQuery = true)
    List<Object[]> findPositionsByProjectIdsRaw(@Param("ids") Collection<Integer> projectIds);

    /**
     * 자신이 등록한 프로젝트 개수 조회
     */
    @Query(value = """
            SELECT COUNT(DISTINCT r.id)
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())) OR
                 (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            """, nativeQuery = true)
    long countMyProjectsWithFilters(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status);

    /**
     * 자신이 등록한 진행중인 프로젝트 개수 조회
     */
    @Query(value = """
            SELECT COUNT(DISTINCT r.id)
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND r.closed_at IS NULL
            AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
            """, nativeQuery = true)
    long countMyRecruitingProjects(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes);

    /**
     * 자신이 등록한 마감된 프로젝트 개수 조회
     */
    @Query(value = """
            SELECT COUNT(DISTINCT r.id)
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))
            """, nativeQuery = true)
    long countMyClosedProjects(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes);

    /**
     * 자신이 등록한 프로젝트 목록 조회 (정렬: created)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                FALSE AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())) OR
                 (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findMyProjectsCreated(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 자신이 등록한 프로젝트 목록 조회 (정렬: views)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                FALSE AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())) OR
                 (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.view_count DESC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findMyProjectsViews(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 자신이 등록한 프로젝트 목록 조회 (정렬: start)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                FALSE AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())) OR
                 (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY r.start_at ASC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findMyProjectsStart(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 자신이 등록한 프로젝트 목록 조회 (정렬: amount)
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                FALSE AS bookmarked
            FROM project r
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND r.member_id = :memberId
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())) OR
                 (:status = 'closed' AND (r.closed_at IS NOT NULL OR (r.apply_deadline IS NOT NULL AND r.apply_deadline <= NOW()))))
            GROUP BY r.id
            ORDER BY total_budget DESC, r.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findMyProjectsAmount(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 북마크한 프로젝트 목록 조회
     * 북마크한 날짜 기준으로 최신순 정렬
     */
    @Query(value = """
            SELECT
                r.id, r.title, r.summary,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                r.thumbnail_url, r.start_at, r.end_at, r.apply_deadline,
                r.created_at, r.updated_at, r.view_count, r.closed_at,
                p.code AS province_code, p.name_ko AS province,
                d.code AS district_code, d.name_ko AS district,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                1 AS bookmarked
            FROM project r
            INNER JOIN project_bookmark pb ON pb.project_id = r.id AND pb.member_id = :memberId
            LEFT JOIN district d ON d.id = r.district_id
            LEFT JOIN province p ON p.id = d.province_id
            LEFT JOIN project_position pp ON pp.project_id = r.id
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN member m ON m.id = r.member_id
            WHERE r.deleted_at IS NULL
            AND r.closed_at IS NULL
            AND (r.apply_deadline IS NULL OR r.apply_deadline > NOW())
            AND (:q IS NULL OR :q = '' OR r.title LIKE CONCAT('%', :q, '%'))
            AND (:hasCategoryIds = false OR c.id IN (:categoryIds))
            AND (:hasPositionIds = false OR pos.id IN (:positionIds))
            AND (:provinceCode IS NULL OR :provinceCode = '' OR p.code = :provinceCode)
            AND (:hasDistrictCodes = false OR d.code IN (:districtCodes))
            AND (:status IS NULL OR :status = '' OR 
                 (:status = 'recruiting' AND r.closed_at IS NULL) OR
                 (:status = 'closed' AND r.closed_at IS NOT NULL))
            GROUP BY r.id
            ORDER BY pb.created_at DESC
            """, nativeQuery = true)
    List<ProjectRow> findBookmarkedProjects(
            @Param("memberId") Integer memberId,
            @Param("q") String q,
            @Param("hasCategoryIds") boolean hasCategoryIds,
            @Param("categoryIds") List<Integer> categoryIds,
            @Param("hasPositionIds") boolean hasPositionIds,
            @Param("positionIds") List<Integer> positionIds,
            @Param("provinceCode") String provinceCode,
            @Param("hasDistrictCodes") boolean hasDistrictCodes,
            @Param("districtCodes") List<String> districtCodes,
            @Param("status") String status,
            Pageable pageable);

    /**
     * 회원의 리뷰 개수 및 평균 평점 조회
     * 
     * @param memberId 회원 ID
     * @return [리뷰 개수, 평균 평점] 배열
     */
    @Query(value = """
            SELECT 
                COUNT(*) AS review_count,
                COALESCE(ROUND(AVG(rating), 1), 0.0) AS average_rating
            FROM review
            WHERE reviewee_member_id = :memberId
            """, nativeQuery = true)
    Object[] findReviewStatsByMemberId(@Param("memberId") Integer memberId);

    /**
     * 프로젝트 ID로 제목 조회
     */
    @Query("SELECT p.title FROM Project p WHERE p.id = :id")
    Optional<String> findTitleById(@Param("id") Integer id);

    /**
     * 관리자용: 리더가 등록한 프로젝트 목록 조회 (삭제된 프로젝트 포함)
     */
    @Query("SELECT p FROM Project p " +
            "WHERE (:memberId IS NULL OR p.memberId = :memberId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.title LIKE %:keyword%) " +
            "ORDER BY p.createdAt DESC")
    Page<Project> findAllProjectsForAdmin(
            @Param("memberId") Integer memberId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 관리자용: 프로젝트 상태별 통계 조회
     */
    @Query("SELECT new com.s401.moas.project.repository.projection.ProjectStatsProjection(" +
            "SUM(CASE WHEN p.deletedAt IS NULL AND p.closedAt IS NULL THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN p.deletedAt IS NULL AND p.closedAt IS NOT NULL THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN p.deletedAt IS NOT NULL THEN 1 ELSE 0 END), " +
            "COUNT(p)" +
            ") FROM Project p")
    ProjectStatsProjection getProjectStatsForAdmin();

    /**
     * 유사 프로젝트 카드 조회용 인터페이스
     */
    interface ProjectCardRow {
        Integer getProjectId();
        String getTitle();
        String getThumbnailUrl();
        String getCategoryName();
        String getLocationText();
        String getLeaderNickname();
        String getLeaderProfileImageUrl();
        Long getTotalBudget();
        Timestamp getStartAt();
        Timestamp getEndAt();
    }

    /**
     * 프로젝트 ID 리스트로 카드 정보 조회
     * 주의: 순서는 Java에서 유지해야 함 (FIELD 함수는 JPA 리스트 바인딩과 호환 안 됨)
     */
    @Query(value = """
            SELECT 
                p.id AS project_id,
                p.title,
                p.thumbnail_url,
                COALESCE(MAX(c.category_name), '') AS category_name,
                CASE 
                    WHEN d.name_ko IS NOT NULL THEN d.name_ko
                    ELSE 'online'
                END AS location_text,
                m.nickname AS leader_nickname,
                m.profile_image_url AS leader_profile_image_url,
                COALESCE(SUM(pp.budget), 0) AS total_budget,
                p.start_at,
                p.end_at
            FROM project p
            LEFT JOIN project_position pp ON pp.project_id = p.id AND pp.deleted_at IS NULL
            LEFT JOIN position pos ON pos.id = pp.position_id
            LEFT JOIN category c ON c.id = pos.category_id
            LEFT JOIN district d ON d.id = p.district_id
            LEFT JOIN member m ON m.id = p.member_id
            WHERE p.id IN (:ids)
            AND p.deleted_at IS NULL
            GROUP BY p.id, p.title, p.thumbnail_url, d.name_ko, m.nickname, m.profile_image_url, p.start_at, p.end_at
            """, nativeQuery = true)
    List<ProjectCardRow> findCardsByIds(@Param("ids") List<Integer> ids);

}
