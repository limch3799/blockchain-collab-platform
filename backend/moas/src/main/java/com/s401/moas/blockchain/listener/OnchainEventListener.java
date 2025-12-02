package com.s401.moas.blockchain.listener;

import com.s401.moas.blockchain.service.OnchainEventProcessService;
import com.s401.moas.blockchain.wrapper.MOASContract;
import io.reactivex.disposables.Disposable;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.web3j.protocol.core.DefaultBlockParameterName;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class OnchainEventListener {

    private final MOASContract moasContractListener;
    private final OnchainEventProcessService onchainEventProcessService;

    private Disposable contractCreatedSubscription;
    private Disposable statusUpdatedSubscription;
    private Disposable contractCanceledSubscription;

    public OnchainEventListener(
            @Qualifier("moasContractListener") MOASContract moasContractListener,
            OnchainEventProcessService onchainEventProcessService
    ) {
        this.moasContractListener = moasContractListener;
        this.onchainEventProcessService = onchainEventProcessService;
    }

    @PostConstruct
    public void startListening() {
        log.info("===== 블록체인 이벤트 리스너를 시작합니다. (자동 재시도 로직 포함) =====");
        final int RETRY_DELAY_SECONDS = 10; // 재시도 대기 시간 (초)

        // --- 1. ContractCreated 구독 ---
        this.contractCreatedSubscription = moasContractListener.contractCreatedEventFlowable(
                        DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST)
                .retryWhen(errors -> errors
                        .doOnNext(error -> log.warn(
                                "## ContractCreated 구독 오류. {}초 후 재시도합니다...", RETRY_DELAY_SECONDS, error))
                        .delay(RETRY_DELAY_SECONDS, TimeUnit.SECONDS)
                )
                .subscribe(
                        this::handleContractCreatedEvent,
                        error -> log.error("ContractCreated 구독이 [복구 불가능] 상태입니다.", error)
                );

        // --- 2. StatusUpdated 구독 ---
        this.statusUpdatedSubscription = moasContractListener.contractStatusUpdatedEventFlowable(
                        DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST)
                .retryWhen(errors -> errors
                        .doOnNext(error -> log.warn(
                                "ContractStatusUpdated 구독 오류. {}초 후 재시도합니다...", RETRY_DELAY_SECONDS, error))
                        .delay(RETRY_DELAY_SECONDS, TimeUnit.SECONDS)
                )
                .subscribe(
                        this::handleStatusUpdatedEvent,
                        error -> log.error("ContractStatusUpdated 구독이 [복구 불가능] 상태입니다.", error)
                );

        // --- 3. ContractCanceled 구독 ---
        this.contractCanceledSubscription = moasContractListener.contractCanceledEventFlowable(
                        DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST)
                .retryWhen(errors -> errors
                        .doOnNext(error -> log.warn(
                                "ContractCanceled 구독 오류. {}초 후 재시도합니다...", RETRY_DELAY_SECONDS, error))
                        .delay(RETRY_DELAY_SECONDS, TimeUnit.SECONDS)
                )
                .subscribe(
                        this::handleContractCanceledEvent,
                        error -> log.error("ContractCanceled 구독이 [복구 불가능] 상태입니다.", error)
                );
    }

    @PreDestroy
    public void stopListening() {
        log.info("===== 블록체인 이벤트 리스너를 중단합니다. =====");
        if (contractCreatedSubscription != null) contractCreatedSubscription.dispose();
        if (statusUpdatedSubscription != null) statusUpdatedSubscription.dispose();
        if (contractCanceledSubscription != null) contractCanceledSubscription.dispose();
    }

    private void handleContractCreatedEvent(MOASContract.ContractCreatedEventResponse event) {
        log.info("[Onchain Event] ContractCreated 감지! TokenId: {}. 처리 서비스 호출.", event.tokenId);
        try {
            onchainEventProcessService.processContractCreation(event);
        } catch (Exception e) {
            log.error("[MINT] 이벤트 처리 최종 실패. 수동 확인 필요. TokenId: {}", event.tokenId, e);
        }
    }

    private void handleStatusUpdatedEvent(MOASContract.ContractStatusUpdatedEventResponse event) {
        log.info("[Onchain Event] ContractStatusUpdated 감지! TokenId: {}, NewStatus: {}", event.tokenId, event.newStatus);

        try {
            onchainEventProcessService.processStatusUpdate(event);
        } catch (Exception e) {
            log.error("[MINT] 이벤트 처리 최종 실패. 수동 확인 필요. TokenId: {}", event.tokenId, e);
        }
    }

    private void handleContractCanceledEvent(MOASContract.ContractCanceledEventResponse event) {
        log.info("[Onchain Event] ContractCanceled 감지! TokenId: {}", event.tokenId);

        try {
            onchainEventProcessService.processContractCancellation(event);
        } catch (Exception e) {
            log.error("[MINT] 이벤트 처리 최종 실패. 수동 확인 필요. TokenId: {}", event.tokenId, e);
        }
    }
}