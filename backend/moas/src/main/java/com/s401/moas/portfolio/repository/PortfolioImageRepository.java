package com.s401.moas.portfolio.repository;

import com.s401.moas.portfolio.domain.PortfolioImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioImageRepository extends JpaRepository<PortfolioImage, Long> {
    // PortfolioImageRepository.java에 추가
    Optional<PortfolioImage> findByOriginalImageId(Long originalImageId);

    /**
     * 포트폴리오 ID로 이미지 목록 조회 (압축 이미지만, imageOrder 순으로 정렬)
     */
    List<PortfolioImage> findByPortfolioIdAndOriginalImageIdIsNotNullOrderByImageOrderAsc(Long portfolioId);
}
