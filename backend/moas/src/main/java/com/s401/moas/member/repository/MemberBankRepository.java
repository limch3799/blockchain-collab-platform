package com.s401.moas.member.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.s401.moas.member.domain.MemberBank;

@Repository
public interface MemberBankRepository extends JpaRepository<MemberBank, Long> {
    
    /**
     * 회원의 활성 계좌 목록 조회 (삭제되지 않은 계좌)
     */
    List<MemberBank> findByMemberIdAndDeletedAtIsNull(Integer memberId);
    
    /**
     * 회원의 특정 상태 계좌 목록 조회 (삭제되지 않은 계좌)
     */
    List<MemberBank> findByMemberIdAndStatusAndDeletedAtIsNull(Integer memberId, 
                                                                 com.s401.moas.member.domain.BankAccountStatus status);
    
    /**
     * 계좌 ID로 조회 (삭제되지 않은 계좌)
     */
    Optional<MemberBank> findByIdAndDeletedAtIsNull(Long id);
    
    /**
     * 회원의 특정 계좌 조회 (삭제되지 않은 계좌)
     */
    Optional<MemberBank> findByIdAndMemberIdAndDeletedAtIsNull(Long id, Integer memberId);
}

