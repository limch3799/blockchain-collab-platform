package com.s401.moas.payment.service;

import com.s401.moas.payment.domain.Order;
import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentFailureLogger {

    private final OrderRepository orderRepository;

    /**
     * 결제 실패 사실을 별도의 '새로운' 트랜잭션으로 DB에 기록합니다.
     * 이 메서드를 호출한 메인 트랜잭션이 롤백되더라도, 이 트랜잭션은 독립적으로 커밋됩니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String orderId) {
        try {
            // findById는 Optional을 반환하므로, orElse(null)로 처리
            Order order = orderRepository.findById(orderId).orElse(null);

            // 주문이 존재하고, 아직 PENDING 상태일 때만 FAILED로 변경
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setPaymentFailure();
                log.info("주문(ID: {})의 상태를 FAILED로 기록했습니다.", orderId);
            }
        } catch (Exception e) {
            // 실패 기록 로직 자체에서 에러가 발생하면, 메인 로직에 영향을 주지 않도록 로그만 남깁니다.
            log.error("결제 실패 상태를 기록하는 중 심각한 오류 발생 (orderId: {}): {}", orderId, e.getMessage());
        }
    }
}