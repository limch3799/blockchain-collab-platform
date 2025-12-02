package com.s401.moas.blockchain.repository;

import com.s401.moas.blockchain.domain.ContractNft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractNftRepository extends JpaRepository<ContractNft, Long> {
    List<ContractNft> findByContractId(Long contractId);

    Optional<ContractNft> findFirstByContractId(Long contractId);

    List<ContractNft> findByContractIdIn(List<Long> contractIds);
}