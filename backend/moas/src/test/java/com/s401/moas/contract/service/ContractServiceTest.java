package com.s401.moas.contract.service;

import com.s401.moas.admin.contract.service.AdminContractService;
import com.s401.moas.contract.domain.ActionLog;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ActionLogRepository;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.domain.OAuthProvider;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.payment.domain.*;
import com.s401.moas.payment.repository.OrderRepository;
import com.s401.moas.payment.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@Slf4j
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class ContractServiceTest {

    @Autowired private ContractService contractService;
    @Autowired private ContractRepository contractRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ActionLogRepository actionLogRepository;
    @Autowired private MemberRepository memberRepository;
    @Autowired private RestTemplate restTemplate;
    @Autowired private AdminContractService adminContractService;

    private MockRestServiceServer mockServer;
    private Member leader;
    private Member artist;
    private Member admin;

    @BeforeEach
    void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);

        // 테스트에 필요한 사용자들을 미리 생성
        leader = memberRepository.save(Member.testBuilder()
                .nickname("TestLeader")
                .provider(OAuthProvider.GOOGLE)
                .providerId("leader_provider_id")
                .role(MemberRole.LEADER)
                .build());

        artist = memberRepository.save(Member.testBuilder()
                .nickname("TestArtist")
                .provider(OAuthProvider.KAKAO)
                .providerId("artist_provider_id")
                .role(MemberRole.ARTIST)
                .build());

        admin = memberRepository.save(Member.testBuilder()
                .nickname("TestAdmin")
                .provider(OAuthProvider.GOOGLE)
                .providerId("admin_provider_id")
                .role(MemberRole.PENDING) // MemberRole에 ADMIN이 있어야 함
                .build());
    }

    // --- calculateDailyWorkingRatio 통합 테스트 ---

    @DisplayName("프로젝트 시작 전에 취소 요청 시, 작업 진행률은 0%여야 한다.")
    @Test
    void calculateDailyWorkingRatio_whenCancelledBeforeStart_shouldReturnZero() {
        // given: 시작일이 '내일'인 계약과 '오늘' 발생한 취소 요청 로그를 DB에 저장
        LocalDateTime now = LocalDateTime.now();
        Contract contract = createAndSaveContract(now.plusDays(1), now.plusDays(11));
        createAndSaveActionLog(contract.getId(), "CONTRACT_CANCELLATION_REQUESTED", now);

        // when: 실제 DB 데이터를 사용하는 서비스 메서드 호출
        BigDecimal ratio = calculateDailyWorkingRatio(contract);

        // then
        assertThat(ratio).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @DisplayName("프로젝트 종료 후에 취소 요청 시, 작업 진행률은 100%여야 한다.")
    @Test
    void calculateDailyWorkingRatio_whenCancelledAfterEnd_shouldReturnOne() {
        // given
        LocalDateTime now = LocalDateTime.now();
        Contract contract = createAndSaveContract(now.minusDays(10), now.minusDays(1));
        createAndSaveActionLog(contract.getId(), "CONTRACT_CANCELLATION_REQUESTED", now);

        // when
        BigDecimal ratio = calculateDailyWorkingRatio(contract);

        // then
        assertThat(ratio).isEqualByComparingTo(BigDecimal.ONE);
    }

    // --- approveContractCancellation 통합 테스트 ---

    @DisplayName("[시나리오 A] 프로젝트 시작 전 취소 시, 수수료를 제외한 전액이 리더에게 환불된다.")
    @Test
    void approveContractCancellation_beforeStart_fullRefund() {
        // given
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        Contract contract = createAndSaveContract(tomorrow, tomorrow.plusDays(10), 100000L, new BigDecimal("3.50"), ContractStatus.CANCELLATION_REQUESTED);

        Order order = createAndSaveOrder(contract, OrderStatus.PAID, "test_payment_key_full");

        mockServer.expect(requestTo("https://api.tosspayments.com/v1/payments/" + order.getPaymentKey() + "/cancel"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.cancelAmount").value(96500L)) // 100000 - 3500
                .andRespond(withSuccess());

        log.info("contractId: {} ", contract.getId());
        log.info("orderId: {}, contractId: {}, 상태: {} ", order.getId(), order.getContractId(), order.getStatus());


        // when
        adminContractService.approveContractCancellation(contract.getId(), admin.getId(), "관리자 메모", null);

        // then
        Contract updatedContract = contractRepository.findById(contract.getId()).get();
        assertThat(updatedContract.getStatus()).isEqualTo(ContractStatus.CANCELED);

        Order updatedOrder = orderRepository.findById(order.getId()).get();
        assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.PARTIAL_CANCELED); // 부분환불이므로

        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.REFUND).hasSize(1)
                .allMatch(p -> p.getAmount() == 96500L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.FEE).hasSize(1)
                .allMatch(p -> p.getAmount() == 3500L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.SETTLEMENT).isEmpty();

        mockServer.verify();
    }

    @DisplayName("[시나리오 B] 진행률 50%일 때 취소 시, 금액이 올바르게 분배된다.")
    @Test
    void approveContractCancellation_at50Percent_correctDistribution() {
        // given
        Contract contract = createAndSaveContract(LocalDateTime.now().minusDays(5), LocalDateTime.now().plusDays(5), 100000L, new BigDecimal("10.00"), ContractStatus.CANCELLATION_REQUESTED);
        Order order = createAndSaveOrder(contract, OrderStatus.PAID, "test_payment_key_50");
        createAndSaveActionLog(contract.getId(), "CONTRACT_CANCELLATION_REQUESTED", LocalDateTime.now());

        mockServer.expect(requestTo("https://api.tosspayments.com/v1/payments/" + order.getPaymentKey() + "/cancel"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.cancelAmount").value(45000L)) // (100000 - 10000) * 0.5
                .andRespond(withSuccess());

        // when
        adminContractService.approveContractCancellation(contract.getId(), admin.getId(), "관리자 메모", null);

        // then
        Contract updatedContract = contractRepository.findById(contract.getId()).get();
        assertThat(updatedContract.getStatus()).isEqualTo(ContractStatus.CANCELED);

        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.REFUND).hasSize(1)
                .allMatch(p -> p.getAmount() == 45000L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.FEE).hasSize(1)
                .allMatch(p -> p.getAmount() == 10000L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.SETTLEMENT).hasSize(1)
                .allMatch(p -> p.getAmount() == 45000L && p.getStatus() == PaymentStatus.PENDING);

        mockServer.verify();
    }

    @DisplayName("[시나리오 B-2] 관리자가 진행률을 20%로 강제 지정 시, 금액이 올바르게 분배된다.")
    @Test
    void approveContractCancellation_withForcedRatio_correctDistribution() {
        // given
        Contract contract = createAndSaveContract(LocalDateTime.now().minusDays(5), LocalDateTime.now().plusDays(5), 100000L, new BigDecimal("10.00"), ContractStatus.CANCELLATION_REQUESTED);
        Order order = createAndSaveOrder(contract, OrderStatus.PAID, "test_payment_key_20");

        mockServer.expect(requestTo("https://api.tosspayments.com/v1/payments/" + order.getPaymentKey() + "/cancel"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.cancelAmount").value(72000L)) // 90000 - 18000
                .andRespond(withSuccess());

        // when
        adminContractService.approveContractCancellation(contract.getId(), admin.getId(), "관리자 메모", new BigDecimal("0.2"));

        // then
        Contract updatedContract = contractRepository.findById(contract.getId()).get();
        assertThat(updatedContract.getStatus()).isEqualTo(ContractStatus.CANCELED);

        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.REFUND).hasSize(1)
                .allMatch(p -> p.getAmount() == 72000L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.FEE).hasSize(1)
                .allMatch(p -> p.getAmount() == 10000L);
        assertThat(payments).filteredOn(p -> p.getType() == PaymentType.SETTLEMENT).hasSize(1)
                .allMatch(p -> p.getAmount() == 18000L && p.getStatus() == PaymentStatus.PENDING);

        mockServer.verify();
    }

    // --- Helper 메서드 (DB 저장 로직 포함) ---

    private Contract createAndSaveContract(LocalDateTime startAt, LocalDateTime endAt) {
        return createAndSaveContract(startAt, endAt, 100000L, new BigDecimal("10.00"), ContractStatus.PAYMENT_COMPLETED);
    }

    private Contract createAndSaveContract(LocalDateTime startAt, LocalDateTime endAt, Long totalAmount, BigDecimal feeRate, ContractStatus status) {
        Contract contract = Contract.testBuilder()
                .projectId(1)
                .leaderMemberId(leader.getId())
                .artistMemberId(artist.getId())
                .title("Test Contract")
                .startAt(startAt)
                .endAt(endAt)
                .totalAmount(totalAmount)
                .appliedFeeRate(feeRate)
                .status(status)
                .build();
        contract.setStatus(status);
        return contractRepository.saveAndFlush(contract);
    }

    private Order createAndSaveOrder(Contract contract, OrderStatus status, String paymentKey) {
        Order order = Order.testBuilder()
                .id("TEST_ORD_" + contract.getId() + "_" + System.currentTimeMillis())
                .contractId(contract.getId())
                .memberId(contract.getLeaderMemberId())
                .amount(contract.getTotalAmount())
                .status(status)
                .paymentKey(paymentKey)
                .build();
        order.setStatus(status);
        return orderRepository.save(order);
    }

    private void createAndSaveActionLog(Long relatedId, String actionType, LocalDateTime createdAt) {
        actionLogRepository.save(ActionLog.testBuilder()
                .relatedId(relatedId)
                .actionType(actionType)
                .createdAt(createdAt)
                .build());
    }

    BigDecimal calculateDailyWorkingRatio(Contract contract) {
        // "CONTRACT_CANCELLATION_REQUESTED" 타입의 가장 최신 actionLog를 찾아서 취소 요청 시점을 가져옴
        ActionLog cancelRequestLog = actionLogRepository
                .findTopByRelatedIdAndActionTypeOrderByCreatedAtDesc(contract.getId(), "CONTRACT_CANCELLATION_REQUESTED")
                .orElseThrow(() -> ContractException.actionLogNotFound(
                        String.format("contractId: %d, actionType: %s", contract.getId(), "CONTRACT_CANCELLATION_REQUESTED")
                ));
        LocalDateTime cancellationRequestTime = cancelRequestLog.getCreatedAt();
        LocalDateTime projectStartTime = contract.getStartAt();
        LocalDateTime projectEndTime = contract.getEndAt();

        log.info("일할 계산 시작: 프로젝트 시작일={}, 종료일={}, 취소 요청일={}", projectStartTime, projectEndTime, cancellationRequestTime);

        if (cancellationRequestTime.isBefore(projectStartTime)) {
            return BigDecimal.ZERO; // 시작 전 취소는 0%
        }
        if (cancellationRequestTime.isAfter(projectEndTime) || cancellationRequestTime.isEqual(projectEndTime)) {
            return BigDecimal.ONE; // 종료 후 취소는 100% (정산 대상)
        }

        long totalDurationDays = ChronoUnit.DAYS.between(projectStartTime, projectEndTime);
        long workedDurationDays = ChronoUnit.DAYS.between(projectStartTime, cancellationRequestTime);

        if (totalDurationDays <= 0) {
            return BigDecimal.ONE; // 계약 기간이 하루거나 잘못된 경우, 100%로 간주
        }

        BigDecimal ratio = new BigDecimal(workedDurationDays).divide(new BigDecimal(totalDurationDays), 4, RoundingMode.HALF_UP);
        log.info("일할 계산 결과: 총 기간={}일, 작업 기간={}일, 진행률={}%", totalDurationDays, workedDurationDays, ratio.movePointRight(2));

        return ratio;
    }
}