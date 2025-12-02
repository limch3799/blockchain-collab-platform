package com.s401.moas.contract.service.dto;

import com.s401.moas.global.util.PageInfo;
import lombok.Getter;
import java.util.List;

@Getter
public class MyContractListDto {
    private final List<ContractItemDto> contracts;
    private final PageInfo pageInfo;

    public MyContractListDto(List<ContractItemDto> contracts, PageInfo pageInfo) {
        this.contracts = contracts;
        this.pageInfo = pageInfo;
    }
}