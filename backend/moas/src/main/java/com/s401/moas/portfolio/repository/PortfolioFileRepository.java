package com.s401.moas.portfolio.repository;

import com.s401.moas.portfolio.domain.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, Long> {
    List<PortfolioFile> findByPortfolioId(Long portfolioId);
}
