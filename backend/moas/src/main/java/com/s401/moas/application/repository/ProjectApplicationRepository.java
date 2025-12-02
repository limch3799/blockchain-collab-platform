package com.s401.moas.application.repository;

import java.util.List;
import java.util.Optional;

import com.s401.moas.application.controller.response.ApplicantListResponse;
import com.s401.moas.application.service.dto.ApplicantDetailBaseDto;
import com.s401.moas.application.service.dto.MyApplicationListDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {
    /**
     * 특정 프로젝트 직무에 특정 회원이 이미 지원했는지 (삭제되지 않은 지원서 기준) 확인합니다.
     * 중복 지원을 방지하기 위해 사용됩니다.
     *
     * @param projectPositionId 프로젝트 직무 ID
     * @param memberId          회원 ID
     * @return 존재하면 true, 그렇지 않으면 false
     */
    boolean existsByProjectPositionIdAndMemberIdAndDeletedAtIsNull(Long projectPositionId, Integer memberId);

    /**
     * 특정 프로젝트 직무에 삭제되지 않은 특정 상태의 지원서가 있는지 확인합니다.
     * 포지션 삭제 가능 여부를 확인하기 위해 사용됩니다.
     * PENDING, OFFERED 상태의 지원서가 있으면 삭제 불가능합니다.
     *
     * @param projectPositionId 프로젝트 직무 ID
     * @param statuses          확인할 지원서 상태 목록
     * @return 해당 상태의 지원서가 존재하면 true, 그렇지 않으면 false
     */
    boolean existsByProjectPositionIdAndStatusInAndDeletedAtIsNull(Long projectPositionId,
            List<ApplicationStatus> statuses);

    /**
     * 삭제되지 않은 지원서 중에서 ID로 조회합니다.
     * 지원 취소(Soft Delete) 로직에서 사용됩니다.
     *
     * @param applicationId 조회할 지원서의 ID
     * @return Optional<ProjectApplication>
     */
    Optional<ProjectApplication> findByIdAndDeletedAtIsNull(Long applicationId);

    /**
     * 계약서 ID로 지원서를 조회합니다.
     * 계약 상태에 따른 지원서 상태를 변경하는 로직에서 사용합니다.
     * 
     * @param contractId 계약서 ID
     * @return Optional<ProjectApplication>
     */
    Optional<ProjectApplication> findByContractId(Long contractId);

    /**
     * 특정 회원이 채용 제안을 받은 지원서가 있는지 확인합니다.
     * 탈퇴 시 제한 조건 확인에 사용됩니다.
     *
     * @param memberId 회원 ID
     * @param status   지원 상태 (OFFERED)
     * @return 제안받은 지원서가 있으면 true, 없으면 false
     */
    boolean existsByMemberIdAndStatusAndDeletedAtIsNull(Integer memberId, ApplicationStatus status);

    /**
     * 특정 회원의 삭제되지 않은 모든 지원서를 조회합니다.
     * 탈퇴 시 지원서 삭제에 사용됩니다.
     *
     * @param memberId 회원 ID
     * @return 해당 회원의 삭제되지 않은 지원서 목록
     */
    List<ProjectApplication> findByMemberIdAndDeletedAtIsNull(Integer memberId);

    /**
     * 특정 회원의 삭제되지 않은 PENDING 상태 지원서 수를 반환합니다.
     */
    int countByMemberIdAndStatusAndDeletedAtIsNull(Integer memberId, ApplicationStatus status);

    @Query("SELECT new com.s401.moas.application.controller.response.ApplicantListResponse$ApplicationSummary(" +
            "    pa.id, pa.status, pa.createdAt, pa.message, c.id, c.status, " +
            "    m.id, m.nickname, m.profileImageUrl, " +
            "    (SELECT ROUND(AVG(r.rating), 2) FROM Review r WHERE r.revieweeMemberId = m.id), " +
            "    (SELECT COUNT(r.id) FROM Review r WHERE r.revieweeMemberId = m.id), " +
            "    pp.id, p.positionName, pp.status" +
            ") " +
            "FROM ProjectApplication pa " +
            "JOIN Member m ON pa.memberId = m.id " +
            "JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
            "JOIN Position p ON pp.positionId = p.id " +
            "LEFT JOIN Contract c ON c.id = pa.contractId " +
            "WHERE pp.projectId = :projectId AND pa.deletedAt IS NULL")
    List<ApplicantListResponse.ApplicationSummary> findApplicationSummariesByProjectId(@Param("projectId") Integer projectId);

    @Query("SELECT new com.s401.moas.application.service.dto.ApplicantDetailBaseDto(" +
            "    pa.id, pa.status, pa.createdAt, pa.message, pa.portfolioId, c.id, c.status, " +
            "    m.id, m.nickname, m.profileImageUrl, " +
            "    ROUND(AVG(r.rating), 2), COUNT(r), " +
            "    pp.id, p.positionName, pp.status" +
            ") " +
            "FROM ProjectApplication pa " +
            "JOIN Member m ON pa.memberId = m.id " +
            "JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
            "JOIN Position p ON pp.positionId = p.id " +
            // [수정] 이 조인 조건을 pa.contractId를 사용하도록 변경합니다.
            "LEFT JOIN Contract c ON pa.contractId = c.id " +
            "LEFT JOIN Review r ON r.revieweeMemberId = pa.memberId " +
            "WHERE pa.id = :applicationId AND pa.deletedAt IS NULL " +
            "GROUP BY pa.id, pa.status, pa.createdAt, pa.message, pa.portfolioId, " +
            "         c.id, c.status, m.id, m.nickname, m.profileImageUrl, " +
            "         pp.id, p.positionName, pp.status")
    Optional<ApplicantDetailBaseDto> findApplicationDetailBaseById(@Param("applicationId") Long applicationId);

    @Query("SELECT pa.status, p.positionName " +
            "FROM ProjectApplication pa " +
            "JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
            "JOIN Position p ON pp.positionId = p.id " +
            "WHERE pp.projectId = :projectId " +
            "AND pa.memberId = :memberId " +
            "AND pa.deletedAt IS NULL")
    List<Object[]> findMyApplicationInfoByProjectId(@Param("projectId") Integer projectId, @Param("memberId") Integer memberId
    );

    /**
     * 특정 회원의 지원서를 단일 상태에 따라 페이지 단위로 조회하며,
     * JPQL 프로젝션을 사용하여 서비스 계층의 DTO로 직접 매핑합니다.
     * DELETED된 지원서와 COMPLETED 상태의 지원서는 제외됩니다.
     * status 파라미터가 null이면 COMPLETED를 제외한 모든 상태의 지원서를 조회합니다.
     *
     * @param memberId 지원자 회원 ID
     * @param status   조회할 지원 상태 (null이면 모든 상태 조회, 단 COMPLETED는 제외)
     * @param pageable 페이징 정보
     * @return 페이지 처리된 MyApplicationListDto.MyApplicationDto 목록
     */
    @Query(value = "SELECT NEW com.s401.moas.application.service.dto.MyApplicationListDto$MyApplicationDto(" +
            "pa.id, pa.status, pa.createdAt, " +
            "pp.id, pos.positionName, " +
            "proj.id, proj.title, proj.thumbnailUrl, " +
            "leader.id, leader.nickname, leader.profileImageUrl, " +
            "c.id, c.status) " +
            "FROM ProjectApplication pa " +
            "JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
            "JOIN Position pos ON pp.positionId = pos.id " +
            "JOIN Project proj ON pp.projectId = proj.id " +
            "JOIN Member leader ON proj.memberId = leader.id " +
            "LEFT JOIN Contract c ON pa.contractId = c.id " +
            "WHERE pa.memberId = :memberId " +
            "AND pa.deletedAt IS NULL " +
            "AND pa.status != 'COMPLETED' " +
            "AND (:status IS NULL OR pa.status = :status)" +
            "ORDER BY pa.createdAt DESC")
    Page<MyApplicationListDto.MyApplicationDto> findMyApplicationsProjectionByMemberId( // 반환 타입 변경
                                                                                        @Param("memberId") Integer memberId,
                                                                                        @Param("status") ApplicationStatus status,
                                                                                        Pageable pageable);

    /**
     * 관리자용: 아티스트가 지원한 프로젝트 목록 조회 (취소된 지원 포함)
     */
    @Query("SELECT pa FROM ProjectApplication pa " +
            "JOIN ProjectPosition pp ON pp.id = pa.projectPositionId " +
            "JOIN Project p ON p.id = pp.projectId " +
            "WHERE (:memberId IS NULL OR pa.memberId = :memberId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.title LIKE %:keyword%) " +
            "ORDER BY pa.createdAt DESC")
    Page<ProjectApplication> findAllApplicationsForAdmin(
            @Param("memberId") Integer memberId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
