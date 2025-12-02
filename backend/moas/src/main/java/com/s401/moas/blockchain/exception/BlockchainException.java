package com.s401.moas.blockchain.exception;

import com.s401.moas.global.exception.base.BaseException;

public class BlockchainException extends BaseException {

    // BaseException의 생성자를 호출하는 기본 생성자
    public BlockchainException(BlockchainErrorCode errorCode) {
        super(errorCode);
    }

    // 외부 라이브러리(web3j 등)에서 발생한 원인(cause)을 포함하기 위한 생성자
    public BlockchainException(BlockchainErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    // === 정적 팩토리 메소드들 ===

    public static BlockchainException onchainRecordNotFound() {
        return new BlockchainException(BlockchainErrorCode.ONCHAIN_RECORD_NOT_FOUND);
    }

    public static BlockchainException transactionFailed() {
        return new BlockchainException(BlockchainErrorCode.TRANSACTION_FAILED);
    }

    // 예외의 원인(cause)을 함께 기록하고 싶을 때 사용
    public static BlockchainException transactionFailed(Throwable cause) {
        return new BlockchainException(BlockchainErrorCode.TRANSACTION_FAILED, cause);
    }

    public static BlockchainException eventNotFound() {
        return new BlockchainException(BlockchainErrorCode.EVENT_NOT_FOUND);
    }

    public static BlockchainException pendingRecordNotFound() {
        return new BlockchainException(BlockchainErrorCode.PENDING_RECORD_NOT_FOUND);
    }

    public static BlockchainException relatedContractNotFound() {
        return new BlockchainException(BlockchainErrorCode.RELATED_CONTRACT_NOT_FOUND);
    }

    public static BlockchainException rpcConnectionError(Throwable cause) {
        return new BlockchainException(BlockchainErrorCode.RPC_CONNECTION_ERROR, cause);
    }

    public static BlockchainException cannotRetryUnfailedJob() {
        return new BlockchainException(BlockchainErrorCode.CANNOT_RETRY_UNFAILED_JOB);
    }

    public static BlockchainException alreadySucceededJobExists() {
        return new BlockchainException(BlockchainErrorCode.ALREADY_SUCCEEDED_JOB_EXISTS);
    }
}