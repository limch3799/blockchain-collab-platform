package com.s401.moas.blockchain.service;

import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.wrapper.MOASContract;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class OnchainBatchService {
    private final Web3j web3j;
    private final OnchainEventProcessService onchainEventProcessService;

    @Transactional
    public void processSingleReconciliation(OnchainRecord record) {
        log.info("[보정] Contract ID: {}, TxHash: {} 상태 확인 시작", record.getContractId(), record.getTxHash());

        String txHash = record.getTxHash();

        // TxHash가 없는 경우, 트랜잭션 전송 단계에서 실패한 것이므로 FAILED 처리하고 종료합니다.
        if (txHash == null || txHash.isBlank()) {
            log.warn("[보정 실패] TxHash가 없어 상태를 확인할 수 없습니다. OnchainRecord ID: {}. 상태를 FAILED로 변경합니다.", record.getId());
            record.setFailed();
            return;
        }

        try {
            // txHash로 블록체인에서 직접 트랜잭션 영수증(Receipt)을 조회합니다.
            Optional<TransactionReceipt> receiptOpt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();

            if (receiptOpt.isEmpty()) {
                log.info("[보정] 트랜잭션이 아직 처리 중입니다. 다음 스케줄링에서 다시 확인합니다. TxHash: {}", txHash);
                return;
            }

            TransactionReceipt receipt = receiptOpt.get();

            if (receipt.isStatusOK()) {
                log.info("[보정 성공] 트랜잭션이 성공적으로 처리된 것을 확인했습니다. TxHash: {}", txHash);

                // OnchainEventListener가 놓친 후처리 로직을 여기서 재실행합니다.
                switch (record.getActionType()) {
                    case MINT -> {
                        List<MOASContract.ContractCreatedEventResponse> events = MOASContract.getContractCreatedEvents(receipt);
                        if (!events.isEmpty()) onchainEventProcessService.processContractCreation(events.get(0));
                    }
                    case UPDATE_STATUS -> {
                        List<MOASContract.ContractStatusUpdatedEventResponse> events = MOASContract.getContractStatusUpdatedEvents(receipt);
                        if (!events.isEmpty()) onchainEventProcessService.processStatusUpdate(events.get(0));
                    }
                    case BURN -> {
                        List<MOASContract.ContractCanceledEventResponse> events = MOASContract.getContractCanceledEvents(receipt);
                        if (!events.isEmpty()) onchainEventProcessService.processContractCancellation(events.get(0));
                    }
                }
            } else {
                log.warn("[보정 실패] 트랜잭션이 실패(reverted)된 것을 확인했습니다. TxHash: {}", txHash);
                record.setFailed();
            }

        } catch (Exception e) {
            log.error("[보정] 트랜잭션 영수증 조회 중 오류 발생. TxHash: {}", txHash, e);
        }
    }
}
