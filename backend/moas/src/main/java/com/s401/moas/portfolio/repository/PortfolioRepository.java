package com.s401.moas.portfolio.repository;

import com.s401.moas.portfolio.domain.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByMemberIdAndDeletedAtIsNull(Integer memberId);

    /**
     * 회원 ID와 포지션 ID로 삭제되지 않은 포트폴리오 존재 여부 확인
     */
    boolean existsByMemberIdAndPositionIdAndDeletedAtIsNull(Integer memberId, Integer positionId);

    /**
     * 회원 ID와 포지션 ID로 삭제되지 않은 포트폴리오 조회
     */
    Optional<Portfolio> findByMemberIdAndPositionIdAndDeletedAtIsNull(Integer memberId, Integer positionId);

    /**
     * ID와 회원 ID로 삭제되지 않은 포트폴리오의 존재 여부를 확인합니다.
     * 포트폴리오의 존재와 소유권을 동시에 검증하는 데 사용됩니다.
     * @param portfolioId 포트폴리오 ID
     * @param memberId    회원 ID
     * @return 존재하면 true, 그렇지 않으면 false
     */
    boolean existsByIdAndMemberIdAndDeletedAtIsNull(Long portfolioId, Integer memberId);

}
