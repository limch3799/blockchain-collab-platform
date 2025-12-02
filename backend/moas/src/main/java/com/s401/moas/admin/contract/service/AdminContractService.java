package com.s401.moas.admin.contract.service;

import com.s401.moas.admin.contract.service.dto.ContractListDto;
import com.s401.moas.admin.contract.service.dto.ContractLogDto;
import com.s401.moas.admin.contract.service.dto.ContractStatisticsDto;
import com.s401.moas.blockchain.event.ContractCanceledEvent;
import com.s401.moas.contract.domain.ActionLog;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ActionLogRepository;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.contract.service.ActionLogService;
import com.s401.moas.contract.service.dto.ContractDetailDto;
import com.s401.moas.contract.service.ContractService;  // 추가
import com.s401.moas.contract.service.dto.ContractStatusUpdateDto;
import com.s401.moas.notification.service.NotificationService;
import com.s401.moas.payment.domain.Order;
import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.exception.PaymentException;
import com.s401.moas.payment.repository.OrderRepository;
import com.s401.moas.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminContractService {

    private final ContractRepository contractRepository;
    private final ActionLogRepository actionLogRepository;
    private final ActionLogService actionLogService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    /**
     * 계약 목록 조회 (검색, 필터, 페이징)
     */
    public Page<ContractListDto> getContracts(
            String searchType,
            String searchKeyword,
            String title,
            ContractStatus status,
            Long memberId,      // 추가
            Long projectId,     // 추가
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        return contractRepository.findAllContractsForAdmin(
                status,
                title,
                searchType,
                searchKeyword,
                memberId,      // 추가
                projectId,     // 추가
                pageable
        );
    }

    /**
     * 계약 통계 조회 (상태별 건수)
     */
    public ContractStatisticsDto getStatistics() {
        List<Object[]> results = contractRepository.countByStatusForAdmin();

        Map<ContractStatus, Long> statusCounts = results.stream()
                .collect(Collectors.toMap(
                        row -> (ContractStatus) row[0],
                        row -> (Long) row[1]
                ));

        Arrays.stream(ContractStatus.values())
                .forEach(status -> statusCounts.putIfAbsent(status, 0L));

        return new ContractStatisticsDto(statusCounts);
    }

    public ContractDetailDto getContractDetail(Long contractId) {
        // 1. 먼저 Contract 엔티티가 있는지 확인
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract 엔티티 자체가 없습니다: " + contractId));

        log.info("Contract 엔티티 조회 성공: id={}, title={}", contract.getId(), contract.getTitle());

        // 2. JPQL 프로젝션 쿼리 시도
        Optional<ContractDetailDto> result = contractRepository.findContractDetailForAdmin(contractId);

        if (result.isEmpty()) {
            log.error("JPQL 프로젝션 쿼리 실패! contractId={}", contractId);
            log.error("Contract 데이터: projectId={}, leaderId={}, artistId={}",
                    contract.getProjectId(), contract.getLeaderMemberId(), contract.getArtistMemberId());
        }

        return result.orElseThrow(ContractException::contractNotFound);
    }

    /**
     * 계약 이력 조회
     */
    public List<ContractLogDto> getContractLogs(Long contractId) {
        return actionLogRepository.findContractLogs(contractId);
    }

    /**
     * 계약 취소 요청 반려
     */
    @Transactional
    public ContractStatusUpdateDto rejectContractCancellation(Long contractId, Integer adminMemberId, String adminMemo) {
        log.info("관리자 계약 취소 반려 처리 시작: contractId={}", contractId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // 상태 변경 (도메인 메서드 호출)
        contract.rejectCancellation();

        // 액션 로그 기록
        actionLogService.recordAction(
                contract.getId(), "CONTRACT_CANCELLATION_REJECTED", adminMemberId,
                Map.of("adminMemo", adminMemo)
        );

        notificationService.createNotification(
                contract.getLeaderMemberId(),
                "CANCELLATION_REJECTED",
                contract.getId()
        );

        log.info("관리자 계약 취소 반려 처리 성공: contractId={}, newStatus={}", contract.getId(), contract.getStatus());
        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * [관리자] 요청된 계약 취소를 승인하고 환불/정산을 진행합니다.
     */
    @Transactional
    public ContractStatusUpdateDto approveContractCancellation(Long contractId, Integer adminMemberId, String adminMemo, BigDecimal forcedWorkingRatio) {
        log.info("관리자 계약 취소 승인 처리 시작: contractId={}", contractId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);
        log.info("contractId: {}", contractId);
        Order order = orderRepository.findFirstByContractIdAndStatusOrderByCreatedAtDesc(contractId, OrderStatus.PAID)
                .orElseThrow(PaymentException::relatedOrderNotFound);

        // --- 1. 수수료 계산 ---
        long totalAmount = order.getAmount();
        BigDecimal feeRate = contract.getAppliedFeeRate().movePointLeft(2); // 3.5 -> 0.035
        long serviceFee = new BigDecimal(totalAmount).multiply(feeRate).setScale(0, RoundingMode.DOWN).longValue();
        long amountAfterFee = totalAmount - serviceFee; // 수수료를 제외하고 분배할 실제 금액

        log.info("취소 처리 금액 계산: 총액={}, 수수료={}, 분배 대상액={}", totalAmount, serviceFee, amountAfterFee);

        long settlementAmountToArtist;
        long refundAmountToLeader;

        // --- 2. 아티스트 정산액 & 리더 환불액 계산 ---
        boolean isBeforeProjectStart = LocalDateTime.now().isBefore(contract.getStartAt());

        if (isBeforeProjectStart) {
            // 시나리오 A: 프로젝트 시작 전 취소 -> 아티스트 정산액 0, 리더에게 전액(수수료 제외) 환불
            log.info("프로젝트 시작 전 취소. 아티스트 정산액은 0입니다.");
            settlementAmountToArtist = 0L;
            refundAmountToLeader = amountAfterFee;
        } else {
            // 시나리오 B: 프로젝트 진행 중 취소 -> 일할 계산 또는 관리자 지정 비율로 분배
            BigDecimal workingRatio;

            if (forcedWorkingRatio != null) {
                // 관리자가 비율을 강제로 지정한 경우
                log.info("관리자가 작업 진행률을 {}%로 강제 지정했습니다.", forcedWorkingRatio.movePointRight(2));
                workingRatio = forcedWorkingRatio;
            } else {
                // 관리자 지정이 없으면 자동으로 일할 계산
                workingRatio = calculateDailyWorkingRatio(contract);
            }

            settlementAmountToArtist = new BigDecimal(amountAfterFee).multiply(workingRatio).setScale(0, RoundingMode.DOWN).longValue();
            refundAmountToLeader = amountAfterFee - settlementAmountToArtist;
        }

        log.info("최종 분배 결정: 아티스트 정산액={}, 리더 환불액={}", settlementAmountToArtist, refundAmountToLeader);

        // --- 3. 실제 환불 및 정산 처리 ---
        // a. 리더에게 (부분)환불 요청
        if (refundAmountToLeader > 0) {
            paymentService.refundPartialAmount(order.getId(), adminMemo, refundAmountToLeader);
        }

        // b. 아티스트에게 지급할 금액을 '정산 예정(PENDING)'으로 기록
        if (settlementAmountToArtist > 0) {
            paymentService.createSettlementRecordForArtist(order, settlementAmountToArtist);
        }

        // c. 서비스 수수료(FEE) 기록
        if (serviceFee > 0) {
            // 이 메서드는 PaymentService에 새로 만들어야 합니다.
            paymentService.createFeeRecord(order, serviceFee, "계약 취소에 따른 수수료");
        }

        // d. 계약 상태 CANCELED로 변경
        contract.approveCancellation();

        // e. 액션 로그 기록
        actionLogService.recordAction(
                contract.getId(), "CONTRACT_CANCELLATION_APPROVED", adminMemberId,
                Map.of("adminMemo", adminMemo,
                        "serviceFee", serviceFee,
                        "settlementAmountToArtist", settlementAmountToArtist,
                        "refundAmountToLeader", refundAmountToLeader)
        );

        applicationEventPublisher.publishEvent(new ContractCanceledEvent(contractId));

        // [알림] 리더와 아티스트 모두에게 계약 취소 승인 알림
        try {
            // 리더에게 알림
            notificationService.createNotification(
                    contract.getLeaderMemberId(),
                    "CANCELLATION_APPROVED",
                    contract.getId()
            );
            // 아티스트에게 알림
            notificationService.createNotification(
                    contract.getArtistMemberId(),
                    "CANCELLATION_APPROVED",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("계약 취소 승인 알림 전송 실패: contractId={}", contract.getId(), e);
        }

        log.info("관리자 계약 취소 승인 처리 성공: contractId={}, newStatus={}", contract.getId(), contract.getStatus());
        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * 계약 취소 요청 시점을 기준으로, 전체 계약 기간 대비 실제 경과된 기간의 비율(일할)을 계산합니다.
     */
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