package com.s401.moas.blockchain.exception;

import com.s401.moas.global.exception.base.BaseException;

public class ContractNftException extends BaseException {

    // BaseException의 생성자를 호출하는 기본 생성자
    public ContractNftException(ContractNftErrorCode errorCode) {
        super(errorCode);
    }

    // 외부 라이브러리(web3j 등)에서 발생한 원인(cause)을 포함하기 위한 생성자
    public ContractNftException(BlockchainErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    // === 정적 팩토리 메소드들 ===

    public static ContractNftException contractNftNotFound() {
        return new ContractNftException(ContractNftErrorCode.CONTRACT_NFT_ERROR_CODE);
    }
}