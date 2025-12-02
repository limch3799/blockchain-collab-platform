package com.s401.moas.blockchain.service.dto;

import lombok.Builder;

import java.math.BigInteger;

@Builder
public record CreateContractOnChainCommand(
        BigInteger tokenId,
        String title,
        byte[] descriptionHash,

        String leaderAddress,
        String artistAddress,

        BigInteger totalAmount,
        String startsAt,
        String endsAt,

        String tokenUri,
        byte[] sigLeader,
        byte[] sigArtist
) {
}