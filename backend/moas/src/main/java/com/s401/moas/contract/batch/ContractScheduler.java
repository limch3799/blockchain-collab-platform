package com.s401.moas.contract.batch;

import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.contract.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContractScheduler {

    private final ContractRepository contractRepository;
    private final ContractService contractService;

    /**
     * 매일 새벽 4시에 실행되어, 완료 조건을 충족하는 계약들을 자동으로 완료 처리합니다.
     * cron = "초 분 시 일 월 요일"
     * "0 0 4 * * *" = 매일 4시 0분 0초
     */
    @Scheduled(cron = "0 0 4 * * *")
    public void autoCompleteContracts() {
        log.info("[배치 시작] 자동 계약 완료 처리를 시작합니다.");

        // 1. 자동 완료 대상 계약을 조회합니다.
        // 조건: 상태가 'PAYMENT_COMPLETED'이고, 종료일(end_at)로부터 14일이 지난 계약들
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusDays(14);
        List<Contract> targetContracts = contractRepository
                .findByStatusAndEndAtBefore(ContractStatus.PAYMENT_COMPLETED, twoWeeksAgo);

        if (targetContracts.isEmpty()) {
            log.info("[배치 종료] 자동 완료 처리할 계약이 없습니다.");
            return;
        }

        log.info("[배치] 총 {}개의 계약을 자동으로 완료 처리합니다.", targetContracts.size());

        // 2. 각 계약에 대해 완료 처리를 진행합니다.
        for (Contract contract : targetContracts) {
            try {
                // 각 계약을 별도의 트랜잭션으로 처리하여 하나가 실패해도 다른 계약에 영향을 주지 않도록 합니다.
                contractService.processContractCompletion(contract.getId());
            } catch (Exception e) {
                // 개별 계약 처리 중 오류 발생 시, 로그만 남기고 다음 계약으로 넘어갑니다.
                log.error("!! [배치 오류] 계약 ID {} 자동 완료 처리 중 오류가 발생했습니다.", contract.getId(), e);
            }
        }
        log.info("[배치 종료] 자동 계약 완료 처리를 완료했습니다.");
    }
}
