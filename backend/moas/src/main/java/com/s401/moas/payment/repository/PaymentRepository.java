package com.s401.moas.payment.repository;
import com.s401.moas.member.service.dto.TransactionHistoryDto;
import com.s401.moas.payment.domain.Payment;
import com.s401.moas.payment.domain.PaymentStatus;
import com.s401.moas.payment.domain.PaymentType;
import com.s401.moas.payment.repository.projection.PaymentProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(String id);

    /**
     * 특정 회원의 모든 관련 거래 내역을 조회합니다. (역할 무관)
     */
    @Query(value = "SELECT new com.s401.moas.member.service.dto.TransactionHistoryDto$TransactionItemDto(" +
            "    p.id, p.type, p.amount, c.title, p.createdAt" +
            ") " +
            "FROM Payment p " +
            "JOIN Order o ON p.orderId = o.id " +
            "JOIN Contract c ON o.contractId = c.id " +
            "WHERE p.status != 'FAILED' AND " +
            "  (p.memberId = :memberId OR " +
            "   o.id IN (SELECT p_sub.orderId FROM Payment p_sub WHERE p_sub.memberId = :memberId AND p_sub.type = 'PAYMENT' AND p_sub.status != 'FAILED')" +
            ") " +
            "ORDER BY p.createdAt DESC",
            countQuery = "SELECT COUNT(p) " +
                    "FROM Payment p JOIN Order o ON p.orderId = o.id " +
                    "WHERE p.status != 'FAILED' AND " +  // TODO 현재 정산 로직이 없어 PENDING 상태 금액도 함께 조회
                    "  (p.memberId = :memberId OR " +
                    "   o.id IN (SELECT p_sub.orderId FROM Payment p_sub WHERE p_sub.memberId = :memberId AND p_sub.type = 'PAYMENT' AND p_sub.status  != 'FAILED')" +
                    ")")
    Page<TransactionHistoryDto.TransactionItemDto> findTransactionItemsByMemberId(@Param("memberId") Integer memberId, Pageable pageable);

    /**
     * 리더의 '정산 완료' 및 '정산 예정' 금액 합계를 조회합니다.
     */
    @Query("SELECT " +
            "   COALESCE(SUM(CASE WHEN c.status = 'COMPLETED' THEN p.amount ELSE 0 END), 0), " +
            "   COALESCE(SUM(CASE WHEN c.status IN ('PAYMENT_COMPLETED', 'CANCELLATION_REQUESTED') THEN p.amount ELSE 0 END), 0) " +
            "FROM Payment p " +
            "JOIN Order o ON p.orderId = o.id " +
            "JOIN Contract c ON o.contractId = c.id " +
            "WHERE p.memberId = :memberId " +
            "AND p.type = 'PAYMENT' " +
            "AND p.status = 'COMPLETED'")
    Object[] findLeaderSummaryAmounts(@Param("memberId") Integer memberId);

    /**
     * 아티스트의 '정산 완료'된 총 금액 합계를 조회합니다.
     */
    @Query("SELECT SUM(p.amount) " +
            "FROM Payment p " +
            "WHERE p.memberId = :memberId " +
            "AND p.type = 'SETTLEMENT' " +
            "AND p.status != 'FAILED'")  // TODO 현재 정산 로직이 없어 PENDING 상태 금액도 함께 조회
    Long findArtistTotalSettlementAmount(@Param("memberId") Integer memberId);

    /**
     * [단일 쿼리 + JPQL Projection]
     * Payment와 Order를 명시적으로 조인하고, 결과를 PaymentProjection DTO로 직접 매핑합니다.
     */
    @Query(value = """
        SELECT new com.s401.moas.payment.repository.projection.PaymentProjection(
            p.id, p.type, p.status, p.amount, 
            p.createdAt, p.completedAt, p.memberId,
            o.id, o.contractId, o.status, o.memberId)
        FROM Payment p, Order o 
        WHERE p.orderId = o.id 
        AND (:types IS NULL OR p.type IN :types)
        AND (:statuses IS NULL OR p.status IN :statuses)
        AND (:startDate IS NULL OR p.createdAt >= :startDate)
        AND (:endDate IS NULL OR p.createdAt <= :endDate)
        AND (:orderId IS NULL OR o.id = :orderId)
        AND (:contractId IS NULL OR o.contractId = :contractId)
        AND (:memberId IS NULL 
             OR p.memberId = :memberId 
             OR o.memberId = :memberId)
        ORDER BY p.createdAt DESC
    """)
    Page<PaymentProjection> findFilteredPaymentsProjection(
            @Param("types") List<PaymentType> types,
            @Param("statuses") List<PaymentStatus> statuses,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("orderId") String orderId,
            @Param("contractId") Long contractId,
            @Param("memberId") Integer memberId,
            Pageable pageable);
}