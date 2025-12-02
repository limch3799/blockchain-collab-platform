package com.s401.moas.member.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.s401.moas.bank.domain.Bank;
import com.s401.moas.bank.repository.BankRepository;
import com.s401.moas.member.controller.request.CreateBankAccountRequest;
import com.s401.moas.member.domain.MemberBank;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberBankRepository;
import com.s401.moas.member.service.AccountEncryptionService.EncryptionResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberBankService {

    private final MemberBankRepository memberBankRepository;
    private final BankRepository bankRepository;
    private final AccountEncryptionService encryptionService;

    /**
     * 계좌 등록
     * 
     * @param memberId 회원 ID
     * @param request 계좌 등록 요청
     * @return 등록된 계좌 정보
     */
    @Transactional
    public MemberBank createBankAccount(Integer memberId, CreateBankAccountRequest request) {
        log.info("계좌 등록 요청: memberId={}, bankCode={}", memberId, request.getBankCode());

        // 1. 기존 활성 계좌 확인 (삭제되지 않은 계좌가 이미 있는지 체크)
        List<MemberBank> existingAccounts = memberBankRepository.findByMemberIdAndDeletedAtIsNull(memberId);
        if (!existingAccounts.isEmpty()) {
            log.warn("이미 활성 계좌가 존재함: memberId={}, existingAccountCount={}", memberId, existingAccounts.size());
            throw MemberException.bankAccountAlreadyExists();
        }

        // 2. 은행 코드 유효성 검증
        bankRepository.findByCode(request.getBankCode())
                .orElseThrow(() -> {
                    log.warn("존재하지 않는 은행 코드: bankCode={}", request.getBankCode());
                    return MemberException.invalidBankCode();
                });

        // 3. 계좌번호 암호화
        String accountNumber = request.getAccountNumber();
        EncryptionResult encryptionResult = encryptionService.encrypt(accountNumber);

        // 4. 계좌번호 마지막 4자리 추출
        String accountLast4 = accountNumber.length() >= 4
                ? accountNumber.substring(accountNumber.length() - 4)
                : accountNumber;

        // 5. 계좌 정보 저장
        MemberBank memberBank = MemberBank.builder()
                .memberId(memberId)
                .bankCode(request.getBankCode())
                .accountHolderName(request.getAccountHolderName())
                .accountNumberCipher(encryptionResult.getCiphertext())
                .accountNumberIv(encryptionResult.getIv())
                .accountLast4(accountLast4)
                .build();

        MemberBank savedBankAccount = memberBankRepository.save(memberBank);

        log.info("계좌 등록 완료: accountId={}, memberId={}, bankCode={}", 
                savedBankAccount.getId(), memberId, request.getBankCode());

        return savedBankAccount;
    }

    /**
     * 회원의 계좌 목록 조회
     * 
     * @param memberId 회원 ID
     * @return 계좌 목록
     */
    public List<MemberBank> getBankAccounts(Integer memberId) {
        return memberBankRepository.findByMemberIdAndDeletedAtIsNull(memberId);
    }

    /**
     * 계좌 삭제 (Soft Delete)
     * 
     * @param memberId 회원 ID
     * @param accountId 계좌 ID
     */
    @Transactional
    public void deleteBankAccount(Integer memberId, Long accountId) {
        log.info("계좌 삭제 요청: memberId={}, accountId={}", memberId, accountId);

        MemberBank memberBank = memberBankRepository
                .findByIdAndMemberIdAndDeletedAtIsNull(accountId, memberId)
                .orElseThrow(() -> {
                    log.warn("계좌를 찾을 수 없음: accountId={}, memberId={}", accountId, memberId);
                    return MemberException.bankAccountNotFound();
                });

        memberBank.delete();
        memberBankRepository.save(memberBank);

        log.info("계좌 삭제 완료: accountId={}, memberId={}", accountId, memberId);
    }

    /**
     * 계좌 검증
     * PENDING 상태의 계좌를 VERIFIED 상태로 변경합니다.
     * 실제로는 금융 API를 통해 검증해야 하지만, 현재는 요청 시 바로 검증 처리합니다.
     * 
     * @param memberId 회원 ID
     * @param accountId 계좌 ID
     * @return 검증된 계좌 정보
     */
    @Transactional
    public MemberBank verifyBankAccount(Integer memberId, Long accountId) {
        log.info("계좌 검증 요청: memberId={}, accountId={}", memberId, accountId);

        MemberBank memberBank = memberBankRepository
                .findByIdAndMemberIdAndDeletedAtIsNull(accountId, memberId)
                .orElseThrow(() -> {
                    log.warn("계좌를 찾을 수 없음: accountId={}, memberId={}", accountId, memberId);
                    return MemberException.bankAccountNotFound();
                });

        // 이미 검증된 계좌인지 확인
        if (memberBank.getStatus() == com.s401.moas.member.domain.BankAccountStatus.VERIFIED) {
            log.info("이미 검증된 계좌: accountId={}, memberId={}", accountId, memberId);
            return memberBank;
        }

        // PENDING 상태가 아니면 예외 발생
        if (memberBank.getStatus() != com.s401.moas.member.domain.BankAccountStatus.PENDING) {
            log.warn("검증할 수 없는 계좌 상태: accountId={}, memberId={}, status={}", 
                    accountId, memberId, memberBank.getStatus());
            throw MemberException.invalidBankAccountStatus();
        }

        // 계좌 검증 처리 (상태를 VERIFIED로 변경하고 verifiedAt 설정)
        memberBank.verify();
        memberBankRepository.save(memberBank);

        log.info("계좌 검증 완료: accountId={}, memberId={}", accountId, memberId);

        return memberBank;
    }

    /**
     * 은행명 조회
     * 
     * @param bankCode 은행 코드
     * @return 은행명
     */
    public String getBankName(String bankCode) {
        return bankRepository.findByCode(bankCode)
                .map(Bank::getName)
                .orElse("알 수 없음");
    }
}

