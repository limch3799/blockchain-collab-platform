package com.s401.moas.contract.controller.response;

import com.s401.moas.contract.service.dto.MyContractListDto;
import com.s401.moas.global.util.PageInfo;
import lombok.Getter;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class MyContractListResponse {
    private final List<ContractItemResponse> contracts;
    private final PageInfo pageInfo;

    private MyContractListResponse(List<ContractItemResponse> contracts, PageInfo pageInfo) {
        this.contracts = contracts;
        this.pageInfo = pageInfo;
    }

    // Service DTO를 Response DTO로 변환하는 정적 팩토리 메서드
    public static MyContractListResponse from(MyContractListDto serviceDto) {
        List<ContractItemResponse> contractResponses = serviceDto.getContracts().stream()
                .map(ContractItemResponse::from)
                .collect(Collectors.toList());
        return new MyContractListResponse(contractResponses, serviceDto.getPageInfo());
    }
}