package com.s401.moas.blockchain.service.dto;

import java.math.BigInteger;

public record OnChainContractDto(
        String transactionHash,
        BigInteger tokenId
) {
}