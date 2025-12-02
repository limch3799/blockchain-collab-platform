package com.s401.moas.contract.repository;

import com.s401.moas.admin.contract.service.dto.ContractListDto;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.service.dto.ContractDetailDto;
import com.s401.moas.contract.service.dto.ContractItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    /**
     * 특정 회원이 리더로 참여한 진행중인 계약이 있는지 확인합니다.
     * 인덱스 활용을 위해 리더와 아티스트를 분리합니다.
     * <p>
     * 진행중 상태: ARTIST_SIGNED, PAYMENT_PENDING, PAYMENT_COMPLETED, CANCELLATION_REQUESTED
     *
     * @param memberId 회원 ID
     * @param statuses 진행중인 계약 상태 목록
     * @return 진행중인 계약이 있으면 true, 없으면 false
     */
    boolean existsByLeaderMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    /**
     * 특정 회원이 아티스트로 참여한 진행중인 계약이 있는지 확인합니다.
     * 인덱스 활용을 위해 리더와 아티스트를 분리합니다.
     *
     * @param memberId 회원 ID
     * @param statuses 진행중인 계약 상태 목록
     * @return 진행중인 계약이 있으면 true, 없으면 false
     */
    boolean existsByArtistMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    /**
     * 특정 회원이 리더로 참여한 계약 개수를 반환합니다.
     */
    int countByLeaderMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    /**
     * 특정 회원이 아티스트로 참여한 계약 개수를 반환합니다.
     */
    int countByArtistMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    /**
     * 특정 회원이 리더로 참여한 계약을 조회합니다.
     * 인덱스 활용을 위해 리더와 아티스트를 분리합니다.
     *
     * @param memberId 회원 ID
     * @param statuses 조회할 계약 상태 목록
     * @return 해당 회원이 리더로 참여한 계약 목록
     */
    List<Contract> findByLeaderMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    /**
     * 특정 회원이 아티스트로 참여한 계약을 조회합니다.
     * 인덱스 활용을 위해 리더와 아티스트를 분리합니다.
     *
     * @param memberId 회원 ID
     * @param statuses 조회할 계약 상태 목록
     * @return 해당 회원이 아티스트로 참여한 계약 목록
     */
    List<Contract> findByArtistMemberIdAndStatusIn(Integer memberId, List<ContractStatus> statuses);

    @Query(value = "SELECT NEW com.s401.moas.contract.service.dto.ContractDetailDto(" +
            "c.id, c.title, c.description, c.leaderSignature, c.artistSignature, " +
            "c.startAt, c.endAt, c.totalAmount, c.status, c.appliedFeeRate, c.createdAt, " +
            "p.id, p.title, " +
            "leader.id, leader.nickname, " +
            "artist.id, artist.nickname, " +
            "pp.id, pos.positionName, cat.categoryName, " +
            "NULL, NULL, NULL, NULL) " +
            "FROM Contract c " +
            "JOIN Project p ON c.projectId = p.id " +
            "JOIN Member leader ON c.leaderMemberId = leader.id " +
            "JOIN Member artist ON c.artistMemberId = artist.id " +
            "LEFT JOIN ProjectApplication pa ON pa.contractId = c.id " +
            "LEFT JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
            "LEFT JOIN Position pos ON pp.positionId = pos.id " +
            "LEFT JOIN Category cat ON pos.categoryId = cat.id " +
            "WHERE c.id = :contractId")
    Optional<ContractDetailDto> findContractDetailProjectionById(@Param("contractId") Long contractId);


    /**
     * 관리자 - 계약 목록 조회 (검색, 필터, 페이징)
     * 삭제된 회원/프로젝트도 조회
     */
    @Query("""
SELECT new com.s401.moas.admin.contract.service.dto.ContractListDto(
    c.id, c.title,
    p.id, p.title,
    leader.id, leader.nickname,
    artist.id, artist.nickname,
    c.totalAmount, c.status,
    c.startAt, c.endAt, c.createdAt
)
FROM Contract c
LEFT JOIN Project p ON c.projectId = p.id
LEFT JOIN Member leader ON c.leaderMemberId = leader.id
LEFT JOIN Member artist ON c.artistMemberId = artist.id
WHERE (:status IS NULL OR c.status = :status)
  AND (:title IS NULL OR c.title LIKE %:title%)
  AND (:memberId IS NULL OR (c.leaderMemberId = :memberId OR c.artistMemberId = :memberId))
  AND (:projectId IS NULL OR c.projectId = :projectId)
  AND (
      :searchType IS NULL OR
      (:searchType = 'MEMBER_ID' AND (
          STR(c.leaderMemberId) = :searchKeyword OR 
          STR(c.artistMemberId) = :searchKeyword
      )) OR
      (:searchType = 'NICKNAME' AND (
          leader.nickname LIKE %:searchKeyword% OR 
          artist.nickname LIKE %:searchKeyword%
      ))
  )
ORDER BY c.createdAt DESC
""")
    Page<ContractListDto> findAllContractsForAdmin(
            @Param("status") ContractStatus status,
            @Param("title") String title,
            @Param("searchType") String searchType,
            @Param("searchKeyword") String searchKeyword,
            @Param("memberId") Long memberId,          // 추가
            @Param("projectId") Long projectId,        // 추가
            Pageable pageable
    );

    /**
     * 관리자 - 계약 상태별 통계
     */
    @Query("""
    SELECT c.status, COUNT(c)
    FROM Contract c
    GROUP BY c.status
    """)
    List<Object[]> countByStatusForAdmin();


    /**
     * 관리자용 계약 상세 조회 (삭제된 회원/프로젝트도 조회)
     */
    @Query("""
    SELECT new com.s401.moas.contract.service.dto.ContractDetailDto(
        c.id, c.title, c.description, c.leaderSignature, c.artistSignature,
        c.startAt, c.endAt, c.totalAmount, c.status, c.appliedFeeRate, c.createdAt,
        p.id, p.title,
        leader.id, leader.nickname,
        artist.id, artist.nickname,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL
    )
    FROM Contract c
    LEFT JOIN Project p ON c.projectId = p.id
    LEFT JOIN Member leader ON c.leaderMemberId = leader.id
    LEFT JOIN Member artist ON c.artistMemberId = artist.id
    WHERE c.id = :contractId
    """)
    Optional<ContractDetailDto> findContractDetailForAdmin(@Param("contractId") Long contractId);


    @Query(value =
            "SELECT NEW com.s401.moas.contract.service.dto.ContractItemDto(" +
                    "   c.id, c.title, c.startAt, c.endAt, c.totalAmount, " +
                    "   CASE " +
                    "       WHEN c.status = com.s401.moas.contract.domain.ContractStatus.COMPLETED THEN 'COMPLETED' " +
                    "       WHEN c.startAt > CURRENT_TIMESTAMP THEN 'BEFORE_START' " +
                    "       ELSE 'IN_PROGRESS' " +
                    "   END, " +
                    "   c.createdAt, p.id, p.title, " +
                    "   pos.positionName, cat.categoryName, " + // <-- categoryName 추가
                    "   leader.id, leader.nickname, artist.id, artist.nickname" +
                    ") " +
                    "FROM Contract c " +
                    "JOIN Project p ON c.projectId = p.id " +
                    "JOIN Member leader ON c.leaderMemberId = leader.id " +
                    "JOIN Member artist ON c.artistMemberId = artist.id " +
                    "LEFT JOIN ProjectApplication pa ON pa.contractId = c.id AND pa.status = 'COMPLETED' " +
                    "LEFT JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
                    "LEFT JOIN Position pos ON pp.positionId = pos.id " +
                    "LEFT JOIN Category cat ON pos.categoryId = cat.id " +
                    "WHERE (c.leaderMemberId = :memberId OR c.artistMemberId = :memberId) " +
                    "AND c.status IN (com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED, com.s401.moas.contract.domain.ContractStatus.COMPLETED) " +
                    "AND (:#{#statusFilter == null} = true OR " +
                    "   (:#{#statusFilter == 'COMPLETED'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.COMPLETED) OR " +
                    "   (:#{#statusFilter == 'BEFORE_START'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED AND c.startAt > CURRENT_TIMESTAMP) OR " +
                    "   (:#{#statusFilter == 'IN_PROGRESS'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED AND c.startAt <= CURRENT_TIMESTAMP)) " +
                    "ORDER BY c.createdAt DESC",
            countQuery =
                    "SELECT COUNT(c) " +
                            "FROM Contract c " +
                            "WHERE (c.leaderMemberId = :memberId OR c.artistMemberId = :memberId) " +
                            "AND c.status IN (com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED, com.s401.moas.contract.domain.ContractStatus.COMPLETED) " +
                            "AND (:#{#statusFilter == null} = true OR " +
                            "   (:#{#statusFilter == 'COMPLETED'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.COMPLETED) OR " +
                            "   (:#{#statusFilter == 'BEFORE_START'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED AND c.startAt > CURRENT_TIMESTAMP) OR " +
                            "   (:#{#statusFilter == 'IN_PROGRESS'} = true AND c.status = com.s401.moas.contract.domain.ContractStatus.PAYMENT_COMPLETED AND c.startAt <= CURRENT_TIMESTAMP))"
    )
    Page<ContractItemDto> findMyContracts(@Param("memberId") int memberId, @Param("statusFilter") String statusFilter, Pageable pageable);


    @Query(value =
            "SELECT NEW com.s401.moas.contract.service.dto.ContractItemDto(" +
                    "   c.id, c.title, c.startAt, c.endAt, c.totalAmount, " +
                    "   CAST(c.status AS string), " +
                    "   c.createdAt, p.id, p.title, " +
                    "   pos.positionName, cat.categoryName, " +
                    "   leader.id, leader.nickname, artist.id, artist.nickname " +
                    ") " +
                    "FROM Contract c " +
                    "JOIN Project p ON c.projectId = p.id " +
                    "JOIN Member leader ON c.leaderMemberId = leader.id " +
                    "JOIN Member artist ON c.artistMemberId = artist.id " +
                    "LEFT JOIN ProjectApplication pa ON pa.contractId = c.id AND pa.status = 'COMPLETED' " +
                    "LEFT JOIN ProjectPosition pp ON pa.projectPositionId = pp.id " +
                    "LEFT JOIN Position pos ON pp.positionId = pos.id " +
                    "LEFT JOIN Category cat ON pos.categoryId = cat.id " +
                    "WHERE (c.leaderMemberId = :memberId OR c.artistMemberId = :memberId) " +
                    "AND c.status IN (com.s401.moas.contract.domain.ContractStatus.CANCELLATION_REQUESTED, com.s401.moas.contract.domain.ContractStatus.CANCELED) " +
                    "AND (:status IS NULL OR c.status = :status) " +
                    "ORDER BY c.createdAt DESC",
            countQuery =
                    "SELECT COUNT(c) " +
                            "FROM Contract c " +
                            "WHERE (c.leaderMemberId = :memberId OR c.artistMemberId = :memberId) " +
                            "AND c.status IN (com.s401.moas.contract.domain.ContractStatus.CANCELLATION_REQUESTED, com.s401.moas.contract.domain.ContractStatus.CANCELED) " +
                            "AND (:status IS NULL OR c.status = :status)"
    )
    Page<ContractItemDto> findMyCanceledContracts(@Param("memberId") int memberId, @Param("status") ContractStatus status, Pageable pageable);

    /**
     * 특정 상태와 특정 날짜 이전에 종료된 계약 목록을 조회합니다.
     * 자동 완료 배치 작업에서 사용됩니다.
     * @param status 조회할 계약 상태
     * @param dateTime 기준 시간
     * @return 조건을 만족하는 계약 리스트
     */
    List<Contract> findByStatusAndEndAtBefore(ContractStatus status, LocalDateTime dateTime);

}