package com.s401.moas.bank.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.s401.moas.bank.domain.Bank;

@Repository
public interface BankRepository extends JpaRepository<Bank, String> {
    Optional<Bank> findByCode(String code);
}

