package com.s401.moas.member.repository;

import com.s401.moas.admin.member.repository.projection.MemberRoleCountProjection;
import com.s401.moas.admin.member.repository.projection.MemberWithStatsProjection;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.domain.OAuthProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByProviderAndProviderId(OAuthProvider provider, String providerId);
    
    /**
     * 닉네임으로 회원 조회 (중복 체크용)
     * 탈퇴 회원도 포함하여 조회 (닉네임은 중복될 수 없으므로)
     */
    boolean existsByNickname(String nickname);

    /**
     * ID로 탈퇴하지 않은 회원을 조회합니다.
     * @param memberId 회원 ID
     * @return Optional<Member>
     */
    Optional<Member> findByIdAndDeletedAtIsNull(Integer memberId);

    // ===== 관리자용 회원 조회 메서드 (DTO Projection) =====

    /**
     * 관리자용 회원 목록 조회 - 통계 정보 포함 (탈퇴 회원 포함)
     * DTO Projection을 사용하여 깔끔하게 매핑
     */
    @Query("SELECT new com.s401.moas.admin.member.repository.projection.MemberWithStatsProjection(" +
            "m.id, " +
            "m.nickname, " +
            "m.email, " +
            "CAST(m.role AS string), " +
            "m.profileImageUrl, " +
            "m.createdAt, " +
            "m.deletedAt, " +
            "COALESCE(tp.score, 0), " +
            "COALESCE(AVG(r.rating), 0.0), " +
            "COUNT(DISTINCT r.id)) " +
            "FROM Member m " +
            "LEFT JOIN TotalPenalty tp ON tp.id = m.id " +
            "LEFT JOIN Review r ON r.revieweeMemberId = m.id " +
            "WHERE (:role IS NULL OR m.role = :role) " +
            "AND (:keyword IS NULL OR :keyword = '' OR m.nickname LIKE %:keyword%) " +
            "GROUP BY m.id, m.nickname, m.email, m.role, m.profileImageUrl, m.createdAt, m.deletedAt, tp.score")
    Page<MemberWithStatsProjection> findMembersWithStats(
            @Param("role") MemberRole role,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 역할별 회원 수 조회 (탈퇴하지 않은 회원만)
     */
    @Query("SELECT new com.s401.moas.admin.member.repository.projection.MemberRoleCountProjection(" +
            "m.role, COUNT(m)) " +
            "FROM Member m " +
            "WHERE m.deletedAt IS NULL " +
            "GROUP BY m.role")
    List<MemberRoleCountProjection> countMembersByRole();

    /**
     * 전체 회원 수 조회 (탈퇴하지 않은 회원만)
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE m.deletedAt IS NULL")
    Long countActiveMembersTotal();
}
