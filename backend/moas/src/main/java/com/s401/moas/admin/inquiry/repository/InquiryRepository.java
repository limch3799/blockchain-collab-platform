package com.s401.moas.admin.inquiry.repository;

import com.s401.moas.admin.inquiry.domain.Inquiry;
import com.s401.moas.admin.inquiry.domain.InquiryCategory;
import com.s401.moas.admin.inquiry.domain.InquiryStatus;
import com.s401.moas.admin.inquiry.repository.projection.InquiryCategoryStatusCount;
import com.s401.moas.admin.inquiry.repository.projection.MemberInquiryCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {

    /**
     * 회원의 문의 목록 동적 검색
     * - category, keyword를 선택적으로 조합하여 검색
     */
    @Query("SELECT i FROM Inquiry i " +
            "WHERE i.memberId = :memberId " +
            "AND (:category IS NULL OR i.category = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR i.title LIKE %:keyword% OR i.content LIKE %:keyword%) " +
            "ORDER BY i.createdAt DESC")
    Page<Inquiry> searchMyInquiries(
            @Param("memberId") Integer memberId,
            @Param("category") InquiryCategory category,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 특정 회원의 PENDING 상태 문의 개수 조회
     */
    Long countByMemberIdAndStatus(Integer memberId, InquiryStatus status);

    /**
     * 여러 회원의 PENDING 상태 문의 개수를 배치로 조회 (Projection 사용)
     */
    @Query("SELECT i.memberId AS memberId, COUNT(i) AS count FROM Inquiry i " +
            "WHERE i.memberId IN :memberIds AND i.status = :status " +
            "GROUP BY i.memberId")
    List<MemberInquiryCountProjection> countPendingInquiriesByMemberIds(
            @Param("memberIds") Iterable<Integer> memberIds,
            @Param("status") InquiryStatus status
    );

    /**
     * 문의 목록 동적 검색
     * - memberId, category, keyword를 선택적으로 조합하여 검색
     */
    @Query("SELECT i FROM Inquiry i " +
            "WHERE (:memberId IS NULL OR i.memberId = :memberId) " +
            "AND (:category IS NULL OR i.category = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR i.title LIKE %:keyword% OR i.content LIKE %:keyword%) " +
            "ORDER BY i.createdAt DESC")
    Page<Inquiry> searchInquiries(
            @Param("memberId") Integer memberId,
            @Param("category") InquiryCategory category,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 카테고리별 상태별 문의 개수 조회 (관리자용 통계)
     */
    @Query("SELECT new com.s401.moas.admin.inquiry.repository.projection.InquiryCategoryStatusCount(" +
            "i.category, i.status, COUNT(i)) " +
            "FROM Inquiry i " +
            "GROUP BY i.category, i.status")
    List<InquiryCategoryStatusCount> getInquiryStatsByCategory();
}
