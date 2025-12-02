package com.s401.moas.blockchain.domain;

public enum ActionType {
    MINT,           // NFT 생성
    UPDATE_STATUS,  // 계약 상태 변경 (e.g., Completed)
    BURN            // NFT 소각
}