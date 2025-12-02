package com.s401.moas.blockchain.batch;

import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.domain.OnchainStatus;
import com.s401.moas.blockchain.repository.OnchainRecordRepository;
import com.s401.moas.blockchain.service.OnchainBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OnchainRecordScheduler {

    private final OnchainRecordRepository onchainRecordRepository;
    private final OnchainBatchService onchainBatchService;

    /**
     * 매 30분마다 실행되어, PENDING 상태로 오래 머물러 있는 온체인 작업을 검사하고 복구합니다.
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void reconcilePendingOnchainRecords() {
        log.info("[보정 배치 시작] 오래된 PENDING 상태의 온체인 기록을 확인합니다.");

        // 1. 생성된 지 45분 이상 지났지만 여전히 PENDING 상태인 레코드들을 조회합니다.
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(45);
        List<OnchainRecord> staleRecords = onchainRecordRepository
                .findByStatusAndCreatedAtBefore(OnchainStatus.PENDING, threshold);

        if (staleRecords.isEmpty()) {
            log.info("[보정 배치 종료] 확인할 대상이 없습니다.");
            return;
        }

        log.info("[보정 배치] 총 {}개의 오래된 PENDING 기록을 확인합니다.", staleRecords.size());

        for (OnchainRecord record : staleRecords) {
            try {
                onchainBatchService.processSingleReconciliation(record);
            } catch (Exception e) {
                log.error("[보정 배치 오류] OnchainRecord ID {} 처리 중 오류 발생.", record.getId(), e);
            }
        }
        log.info("[보정 배치 종료] 오래된 PENDING 상태의 온체인 기록 확인을 완료했습니다.");
    }
}
