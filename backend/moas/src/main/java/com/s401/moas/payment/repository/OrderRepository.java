package com.s401.moas.payment.repository;

import com.s401.moas.payment.domain.Order;
import com.s401.moas.payment.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    /**
     * 특정 계약 ID에 연결된, 주어진 상태의 주문을 '가장 최근 생성된 순서'로 1건만 조회합니다.
     * @param contractId 계약 ID
     * @param status     조회할 주문의 상태
     * @return 가장 최근의 주문 정보를 담은 Optional 객체
     */
    Optional<Order> findFirstByContractIdAndStatusOrderByCreatedAtDesc(Long contractId, OrderStatus status);
}