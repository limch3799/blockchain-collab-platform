package com.s401.moas.admin.feepolicy.service;

import com.s401.moas.admin.auth.domain.Admin;
import com.s401.moas.admin.auth.exception.AdminAuthException;
import com.s401.moas.admin.auth.repository.AdminRepository;
import com.s401.moas.admin.feepolicy.controller.request.FeePolicyUpdateRequest;
import com.s401.moas.admin.feepolicy.domain.FeePolicy;
import com.s401.moas.admin.feepolicy.exception.FeePolicyException;
import com.s401.moas.admin.feepolicy.repository.FeePolicyRepository;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyHistoryDto;
import com.s401.moas.admin.feepolicy.service.dto.FeePolicyUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminFeePolicyService {

    private final FeePolicyRepository feePolicyRepository;
    private final AdminRepository adminRepository;

    /**
     * 수수료 정책 변경
     */
    @Transactional
    public FeePolicyUpdateDto updateFeePolicy(FeePolicyUpdateRequest request, Integer adminId) {
        // 1. 관리자 확인
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(AdminAuthException::adminNotFound);

        // 2. 수수료율 검증 (0~100)
        BigDecimal feeRate = request.getFeeRate();
        if (feeRate.compareTo(BigDecimal.ZERO) < 0 || feeRate.compareTo(new BigDecimal("100.00")) > 0) {
            throw FeePolicyException.invalidFeeRate();
        }

        // 3. 시작일을 00:00:00으로 정규화
        LocalDateTime startAt = LocalDateTime.of(request.getStartAt(), LocalTime.MIN);

        // 4. 미래 날짜 검증
        if (!startAt.isAfter(LocalDateTime.now())) {
            throw FeePolicyException.invalidStartDate();
        }

        // 5. 미래 정책 확인
        Optional<FeePolicy> existingFuturePolicy = feePolicyRepository.findFuturePolicy(LocalDateTime.now());

        FeePolicy policy;
        if (existingFuturePolicy.isPresent()) {
            // 기존 미래 정책 업데이트
            policy = existingFuturePolicy.get();
            policy.updateFeeRate(feeRate, startAt);
            log.info("기존 미래 수수료 정책 업데이트: policyId={}, adminId={}", policy.getId(), adminId);
        } else {
            // 새 미래 정책 생성
            policy = FeePolicy.builder()
                    .createdBy(adminId)
                    .feeRate(feeRate)
                    .startAt(startAt)
                    .build();
            policy = feePolicyRepository.save(policy);
            log.info("새 수수료 정책 생성: policyId={}, adminId={}", policy.getId(), adminId);
        }

        return FeePolicyUpdateDto.of(policy, admin);
    }

    /**
     * 수수료 변경 이력 조회
     */
    public FeePolicyHistoryDto getFeePolicyHistory() {
        // 1. 전체 정책 조회 (최신순)
        List<FeePolicy> policies = feePolicyRepository.findAllByOrderByStartAtDesc();

        if (policies.isEmpty()) {
            return FeePolicyHistoryDto.builder()
                    .policies(List.of())
                    .build();
        }

        // 2. 각 정책의 endAt 계산
        List<FeePolicyHistoryDto.FeePolicyHistoryItemDto> historyItems = new ArrayList<>();

        for (int i = 0; i < policies.size(); i++) {
            FeePolicy current = policies.get(i);

            // 다음 정책의 startAt이 현재 정책의 endAt
            LocalDateTime endAt = null;
            if (i > 0) {
                endAt = policies.get(i - 1).getStartAt();
            }

            // 관리자 정보 조회
            Admin admin = adminRepository.findById(current.getCreatedBy())
                    .orElse(null);

            String adminName = (admin != null) ? admin.getName() : "알 수 없음";

            historyItems.add(FeePolicyHistoryDto.FeePolicyHistoryItemDto.builder()
                    .policyId(current.getId())
                    .feeRate(current.getFeeRate())
                    .startAt(current.getStartAt())
                    .endAt(endAt)
                    .adminName(adminName)
                    .build());
        }

        return FeePolicyHistoryDto.builder()
                .policies(historyItems)
                .build();
    }
}