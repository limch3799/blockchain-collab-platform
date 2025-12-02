package com.s401.moas.blockchain.service;

import com.s401.moas.blockchain.domain.*;
import com.s401.moas.blockchain.exception.BlockchainException;
import com.s401.moas.blockchain.repository.ContractNftRepository;
import com.s401.moas.blockchain.repository.OnchainRecordRepository;
import com.s401.moas.blockchain.wrapper.MOASContract;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnchainEventProcessService {

    private final OnchainRecordRepository onchainRecordRepository;
    private final ContractNftRepository contractNftRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    /**
     * ContractCreated 이벤트를 처리합니다.
     * BlockchainException 발생 시, 2초 간격으로 최대 5번 재시도합니다.
     */
    @Retryable(
            retryFor = { BlockchainException.class },
            maxAttempts = 5,
            backoff = @Backoff(delay = 2000)
    )
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processContractCreation(MOASContract.ContractCreatedEventResponse event) {
        log.info(">> DB 처리 시작 [MINT]: TokenId: {}", event.tokenId);

        Optional<OnchainRecord> recordOpt = onchainRecordRepository
                .findByContractIdAndActionTypeAndStatus(event.tokenId.longValue(), ActionType.MINT, OnchainStatus.PENDING);

        if (recordOpt.isEmpty()) {
            log.warn(">> PENDING 기록을 찾지 못해 재시도합니다... TokenId: {}", event.tokenId);
            throw BlockchainException.pendingRecordNotFound();
        }

        OnchainRecord record = recordOpt.get();
        record.setSucceeded(event.log.getTransactionHash());

        Contract contract = contractRepository.findById(event.tokenId.longValue()).orElse(null);
        if (contract == null) {
            log.error("CRITICAL: Contract가 DB에 없습니다. TokenId: {}", event.tokenId);
            // 이 경우는 재시도해도 소용없으므로, @Recover 메소드를 사용하여 별도 처리를 할 수도 있습니다.
            throw BlockchainException.relatedContractNotFound();
        }

        ContractNft leaderNft = ContractNft.builder().contractId(contract.getId()).mintTxHash(event.log.getTransactionHash()).ownerMemberId(contract.getLeaderMemberId()).build();
        ContractNft artistNft = ContractNft.builder().contractId(contract.getId()).mintTxHash(event.log.getTransactionHash()).ownerMemberId(contract.getArtistMemberId()).build();
        contractNftRepository.saveAll(List.of(leaderNft, artistNft));
        log.info(">> DB 처리 완료 [MINT]: OnchainRecord SUCCEEDED, ContractNft 생성. TokenId: {}", event.tokenId);

        // [알림] 리더와 아티스트에게 NFT 발행 완료 알림
        try {
            // 리더에게 알림
            notificationService.createNotification(
                    contract.getLeaderMemberId(),
                    "NFT_MINTED",
                    contract.getId()
            );
            // 아티스트에게 알림
            notificationService.createNotification(
                    contract.getArtistMemberId(),
                    "NFT_MINTED",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("NFT 발행 완료 알림 전송 실패: contractId={}", contract.getId(), e);
        }
    }


    /**
     * ContractStatusUpdated 이벤트를 처리합니다.
     */
    @Retryable(retryFor = { BlockchainException.class }, maxAttempts = 5, backoff = @Backoff(delay = 2000))
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processStatusUpdate(MOASContract.ContractStatusUpdatedEventResponse event) {
        log.info(">> DB 처리 시작 [UPDATE_STATUS]: TokenId: {}", event.tokenId);

        Optional<OnchainRecord> recordOpt = onchainRecordRepository
                .findByContractIdAndActionTypeAndStatus(event.tokenId.longValue(), ActionType.UPDATE_STATUS, OnchainStatus.PENDING);
        if (recordOpt.isEmpty()) throw BlockchainException.pendingRecordNotFound();

        OnchainRecord record = recordOpt.get();
        record.setSucceeded(event.log.getTransactionHash());
        log.info(">> DB 처리 완료 [UPDATE_STATUS]: OnchainRecord SUCCEEDED. TokenId: {}", event.tokenId);
    }

    /**
     * ContractCanceled 이벤트를 처리합니다.
     */
    @Retryable(retryFor = { BlockchainException.class }, maxAttempts = 5, backoff = @Backoff(delay = 2000))
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processContractCancellation(MOASContract.ContractCanceledEventResponse event) {
        log.info(">> DB 처리 시작 [BURN]: TokenId: {}", event.tokenId);
        Optional<OnchainRecord> recordOpt = onchainRecordRepository
                .findByContractIdAndActionTypeAndStatus(event.tokenId.longValue(), ActionType.BURN, OnchainStatus.PENDING);
        if (recordOpt.isEmpty()) throw BlockchainException.pendingRecordNotFound();

        OnchainRecord record = recordOpt.get();
        record.setSucceeded(event.log.getTransactionHash());

        List<ContractNft> nfts = contractNftRepository.findByContractId(event.tokenId.longValue());
        if (!nfts.isEmpty()) {
            nfts.forEach(ContractNft::burn);
            log.info(">> DB 처리 완료 [BURN]: OnchainRecord SUCCEEDED, ContractNft {}건 소각 처리. TokenId: {}", nfts.size(), event.tokenId);
        } else {
            log.warn(">> 소각할 ContractNft 레코드를 찾을 수 없습니다. TokenId: {}", event.tokenId);
        }
    }
}