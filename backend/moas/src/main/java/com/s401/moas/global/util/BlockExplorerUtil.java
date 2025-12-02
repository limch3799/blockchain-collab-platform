package com.s401.moas.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // StringUtils 사용을 위해 추가
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class BlockExplorerUtil {

    private final String scanBaseUrl;
    private final String contractAddress;

    public BlockExplorerUtil(
            @Value("${blockchain.scan.base-url}") String scanBaseUrl,
            @Value("${blockchain.contract.moas-address}") String contractAddress) {
        this.scanBaseUrl = scanBaseUrl;
        this.contractAddress = contractAddress;
    }

    /**
     * 1. 특정 NFT(Token ID)의 상세 페이지 URL 생성
     * 결과: https://.../nft/{contractAddress}/{tokenId}
     */
    public String buildNftUrl(Long tokenId) {
        if (tokenId == null) {
            throw new IllegalArgumentException("Token ID cannot be null");
        }

        return UriComponentsBuilder.fromUriString(scanBaseUrl)
                .pathSegment("nft", contractAddress, String.valueOf(tokenId))
                .build()
                .toUriString();
    }

    /**
     * 2. 사용자 지갑의 NFT 전송 내역(Transfers) 페이지 URL 생성
     * 결과: https://.../address/{walletAddress}/nft-transfers
     */
    public String buildWalletNftTransfersUrl(String walletAddress) {
        if (!StringUtils.hasText(walletAddress)) {
            throw new IllegalArgumentException("Wallet address cannot be empty");
        }

        return UriComponentsBuilder.fromUriString(scanBaseUrl)
                .pathSegment("address", walletAddress, "nft-transfers")
                .build()
                .toUriString();
    }
}