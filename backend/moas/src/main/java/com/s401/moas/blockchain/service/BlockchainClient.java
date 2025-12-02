package com.s401.moas.blockchain.service;

import com.s401.moas.blockchain.service.dto.CreateContractOnChainCommand;
import com.s401.moas.blockchain.service.dto.OnChainContractDto;
import com.s401.moas.blockchain.wrapper.MOASContract;
import com.s401.moas.blockchain.exception.BlockchainException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
public class BlockchainClient {

    private final MOASContract moasContractWriter;
    private final MOASContract moasContractListener;

    public BlockchainClient(
            @Qualifier("moasContractWriter") MOASContract moasContractWriter,
            @Qualifier("moasContractListener") MOASContract moasContractListener
    ) {
        this.moasContractWriter = moasContractWriter;
        this.moasContractListener = moasContractListener;
    }

    // =========================================================================
    // =========== 비동기 트랜잭션 전송 (Send-and-Forget) 메소드들 ===========
    // =========================================================================

    public String sendCreateContractTransaction(CreateContractOnChainCommand command) throws Exception {
        log.info("[직접 호출/비동기] 계약 생성 트랜잭션을 전송합니다. TokenId: {}", command.tokenId());
        CompletableFuture<TransactionReceipt> future = moasContractWriter.createContract(
                command.tokenId(), command.title(), command.descriptionHash(), command.leaderAddress(), command.artistAddress(),
                command.totalAmount(), command.startsAt(), command.endsAt(), command.tokenUri(),
                command.sigLeader(), command.sigArtist()
        ).sendAsync();
        return future.get().getTransactionHash();
    }

    public String sendUpdateContractStatusTransaction(BigInteger tokenId) throws Exception {
        log.info("[직접 호출/비동기] 계약 상태 변경 트랜잭션을 전송합니다. TokenId: {}", tokenId);
        CompletableFuture<TransactionReceipt> future = moasContractWriter.updateContractStatus(tokenId, BigInteger.ONE).sendAsync();
        return future.get().getTransactionHash();
    }

    public String sendCancelContractTransaction(BigInteger tokenId) throws Exception {
        log.info("[직접 호출/비동기] 계약 취소 트랜잭션을 전송합니다. TokenId: {}", tokenId);
        CompletableFuture<TransactionReceipt> future = moasContractWriter.cancelContract(tokenId).sendAsync();
        return future.get().getTransactionHash();
    }

    // =========================================================================
    // ================ 동기 트랜잭션 처리 (Wait-for-Receipt) 메소드들 ================
    // =========================================================================

    public OnChainContractDto createContractOnChain(CreateContractOnChainCommand command) {
        try {
            log.info("[직접 호출/동기] 블록체인 계약 생성을 요청합니다. TokenId: {}", command.tokenId());
            TransactionReceipt receipt = moasContractWriter.createContract(
                    command.tokenId(), command.title(), command.descriptionHash(), command.leaderAddress(), command.artistAddress(),
                    command.totalAmount(), command.startsAt(), command.endsAt(), command.tokenUri(),
                    command.sigLeader(), command.sigArtist()
            ).send();

            if (!receipt.isStatusOK()) {
                throw BlockchainException.transactionFailed();
            }

            List<MOASContract.ContractCreatedEventResponse> events = MOASContract.getContractCreatedEvents(receipt);
            if (events.isEmpty() || !events.get(0).tokenId.equals(command.tokenId())) {
                throw BlockchainException.eventNotFound();
            }

            log.info("블록체인 계약 생성 성공! TxHash: {}, TokenId: {}", receipt.getTransactionHash(), command.tokenId());
            return new OnChainContractDto(receipt.getTransactionHash(), command.tokenId());

        } catch (Exception e) {
            log.error("블록체인 계약 생성 중 심각한 오류 발생", e);
            throw BlockchainException.transactionFailed(e);
        }
    }

    public TransactionReceipt updateContractStatusOnChain(BigInteger tokenId) {
        try {
            log.info("[직접 호출/동기] 블록체인 계약 상태 변경을 요청합니다. TokenId: {}", tokenId);
            return moasContractWriter.updateContractStatus(tokenId, BigInteger.ONE).send();
        } catch (Exception e) {
            log.error("블록체인 계약 상태 변경 중 오류 발생", e);
            throw BlockchainException.transactionFailed(e);
        }
    }

    public TransactionReceipt cancelContractOnChain(BigInteger tokenId) {
        try {
            log.info("[직접 호출/동기] 블록체인 계약 취소를 요청합니다. TokenId: {}", tokenId);
            return moasContractWriter.cancelContract(tokenId).send();
        } catch (Exception e) {
            log.error("블록체인 계약 취소 중 오류 발생", e);
            throw BlockchainException.transactionFailed(e);
        }
    }

    // =========================================================================
    // =========================== 읽기 전용 메소드 ===========================
    // =========================================================================

    public BigInteger getContractStatus(BigInteger tokenId) {
        try {
            return moasContractListener.contractStatus(tokenId).send();
        } catch (Exception e) {
            log.error("블록체인 계약 상태 조회 중 오류 발생. TokenId: {}", tokenId, e);
            throw BlockchainException.transactionFailed(e);
        }
    }
}