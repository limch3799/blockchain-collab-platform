package com.s401.moas.blockchain.listener;

import com.s401.moas.blockchain.domain.ActionType;
import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.domain.OnchainStatus;
import com.s401.moas.blockchain.event.ContractCanceledEvent;
import com.s401.moas.blockchain.event.ContractCompletedEvent;
import com.s401.moas.blockchain.event.ContractPaidEvent;
import com.s401.moas.blockchain.repository.OnchainRecordRepository;
import com.s401.moas.blockchain.service.BlockchainClient;
import com.s401.moas.blockchain.service.dto.CreateContractOnChainCommand;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContractCommandListener {

    private final BlockchainClient blockchainClient;
    private final ContractRepository contractRepository;
    private final OnchainRecordRepository onchainRecordRepository;
    private final MemberRepository memberRepository;

    @Value("${app.metadata.base-uri}")
    private String metadataBaseUri;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleContractPaidEvent(ContractPaidEvent event) {
        log.info("[명령] 계약 ID {}의 NFT 발행 트랜잭션 전송을 시작합니다.", event.getContractId());

        Contract contract = contractRepository.findById(event.getContractId())
                .orElseThrow(ContractException::contractNotFound);

        if (onchainRecordRepository.existsByContractIdAndActionTypeAndStatus(contract.getId(), ActionType.MINT, OnchainStatus.SUCCEEDED)) {
            log.warn("[명령 중단] 계약 ID {}는 이미 성공적인 NFT 발행 기록이 존재합니다.", contract.getId());
            return;
        }

        OnchainRecord record = onchainRecordRepository.save(
                OnchainRecord.builder()
                        .contractId(contract.getId())
                        .actionType(ActionType.MINT)
                        .status(OnchainStatus.PENDING)
                        .build()
        );

        try {
            CreateContractOnChainCommand command = buildCreateCommand(contract);
            String txHash = blockchainClient.sendCreateContractTransaction(command);
            record.setTxHash(txHash); // 전송 후 받은 txHash를 기록
            log.info(">> NFT 발행 트랜잭션 전송 완료. Contract ID: {}, TxHash: {}", contract.getId(), txHash);
        } catch (Exception e) {
            log.error("NFT 발행 트랜잭션 '전송' 중 오류 발생.", e);
            record.setFailed();
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleContractCompletedEvent(ContractCompletedEvent event) {
        log.info("[명령] 계약 ID {}의 온체인 상태 변경(Completed) 트랜잭션 전송을 시작합니다.", event.getContractId());

        Contract contract = contractRepository.findById(event.getContractId())
                .orElseThrow(ContractException::contractNotFound);

        OnchainRecord record = onchainRecordRepository.save(
                OnchainRecord.builder()
                        .contractId(contract.getId())
                        .actionType(ActionType.UPDATE_STATUS)
                        .status(OnchainStatus.PENDING)
                        .build()
        );

        try {
            String txHash = blockchainClient.sendUpdateContractStatusTransaction(BigInteger.valueOf(contract.getId()));
            record.setTxHash(txHash);
            log.info(">> 온체인 상태 변경 트랜잭션 전송 완료. Contract ID: {}, TxHash: {}", contract.getId(), txHash);
        } catch (Exception e) {
            log.error("온체인 상태 변경 트랜잭션 '전송' 중 오류 발생.");
            record.setFailed();
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleContractCanceledEvent(ContractCanceledEvent event) {
        log.info("[명령] 계약 ID {}의 NFT 소각 트랜잭션 전송을 시작합니다.", event.getContractId());

        Contract contract = contractRepository.findById(event.getContractId())
                .orElseThrow(ContractException::contractNotFound);

        OnchainRecord record = onchainRecordRepository.save(
                OnchainRecord.builder()
                        .contractId(contract.getId())
                        .actionType(ActionType.BURN)
                        .status(OnchainStatus.PENDING)
                        .build()
        );

        try {
            String txHash = blockchainClient.sendCancelContractTransaction(BigInteger.valueOf(contract.getId()));
            record.setTxHash(txHash);
            log.info(">> NFT 소각 트랜잭션 전송 완료. Contract ID: {}, TxHash: {}", contract.getId(), txHash);
        } catch (Exception e) {
            log.error("NFT 소각 트랜잭션 '전송' 중 오류 발생.");
            record.setFailed();
        }
    }

    private CreateContractOnChainCommand buildCreateCommand(Contract contract) {
        Member leader = memberRepository.findById(contract.getLeaderMemberId()).orElseThrow(MemberException::memberNotFound);
        Member artist = memberRepository.findById(contract.getArtistMemberId()).orElseThrow(MemberException::memberNotFound);

        byte[] descriptionBytes = contract.getDescription().getBytes(StandardCharsets.UTF_8);
        byte[] descriptionHashBytes = Hash.sha3(descriptionBytes);

        BigInteger totalAmountAsBigInteger = BigInteger.valueOf(contract.getTotalAmount());
        byte[] leaderSigBytes = contract.getLeaderSignature() != null ? Numeric.hexStringToByteArray(contract.getLeaderSignature()) : new byte[0];
        byte[] artistSigBytes = contract.getArtistSignature() != null ? Numeric.hexStringToByteArray(contract.getArtistSignature()) : new byte[0];

        return new CreateContractOnChainCommand(
                BigInteger.valueOf(contract.getId()),
                contract.getTitle(),
                descriptionHashBytes,
                leader.getWalletAddress(),
                artist.getWalletAddress(),
                totalAmountAsBigInteger,
                contract.getStartAt().toString(),
                contract.getEndAt().toString(),
                metadataBaseUri + "/" + contract.getId(),
                leaderSigBytes,
                artistSigBytes
        );
    }
}