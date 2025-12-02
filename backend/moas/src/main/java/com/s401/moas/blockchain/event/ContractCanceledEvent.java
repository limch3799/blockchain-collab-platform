package com.s401.moas.blockchain.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter @RequiredArgsConstructor
public class ContractCanceledEvent {
    private final Long contractId;
}