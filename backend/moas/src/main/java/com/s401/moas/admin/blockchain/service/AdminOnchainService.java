package com.s401.moas.admin.blockchain.service;

import com.s401.moas.admin.blockchain.service.dto.FailedOnchainRecordDto;
import com.s401.moas.admin.blockchain.service.dto.OnchainRecordDetailDto;
import com.s401.moas.admin.blockchain.service.dto.RetryResponseDto;
import com.s401.moas.blockchain.domain.ActionType;
import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.domain.OnchainStatus;
import com.s401.moas.blockchain.event.ContractCanceledEvent;
import com.s401.moas.blockchain.event.ContractCompletedEvent;
import com.s401.moas.blockchain.event.ContractPaidEvent;
import com.s401.moas.blockchain.exception.BlockchainException;
import com.s401.moas.blockchain.repository.OnchainRecordRepository;

import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOnchainService {

    private final OnchainRecordRepository onchainRecordRepository;
    private final ContractRepository contractRepository;
    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;

    public Page<FailedOnchainRecordDto> getFailedRecords(Pageable pageable, ActionType type) {
        Page<OnchainRecord> failedRecordsPage;

        // 'type' 파라미터가 있으면 타입으로 필터링하는 쿼리, 없으면 전체 FAILED 목록 쿼리 호출
        if (type != null) {
            failedRecordsPage = onchainRecordRepository.findByStatusAndActionTypeOrderByUpdatedAtDesc(
                    OnchainStatus.FAILED, type, pageable
            );
        } else {
            failedRecordsPage = onchainRecordRepository.findByStatusOrderByUpdatedAtDesc(
                    OnchainStatus.FAILED, pageable
            );
        }

        // 조회된 Page<OnchainRecord>를 Page<FailedOnchainRecordDto>로 변환하여 반환
        return failedRecordsPage.map(FailedOnchainRecordDto::fromEntity);
    }

    public OnchainRecordDetailDto getOnchainRecordDetails(Long recordId) {
        // 1. PathVariable로 받은 recordId로 대상 OnchainRecord를 조회
        OnchainRecord targetRecord = onchainRecordRepository.findById(recordId)
                .orElseThrow(BlockchainException::onchainRecordNotFound); // 404 Not Found

        // 2. targetRecord에서 contractId를 얻어 관련 Contract 정보를 조회
        Contract contract = contractRepository.findById(targetRecord.getContractId())
                .orElseThrow(BlockchainException::relatedContractNotFound);

        // 3. Contract 정보에서 리더와 아티스트의 Member 정보를 조회
        Member leader = memberRepository.findById(contract.getLeaderMemberId())
                .orElseThrow(MemberException::memberNotFound);
        Member artist = memberRepository.findById(contract.getArtistMemberId())
                .orElseThrow(MemberException::memberNotFound);

        // 4. contractId를 사용하여 해당 계약의 모든 온체인 이력을 조회
        List<OnchainRecord> history = onchainRecordRepository.findByContractIdOrderByIdDesc(contract.getId());

        // 5. 조회된 모든 정보를 DTO 생성자에 전달하여 최종 응답 객체를 만듭니다.
        return OnchainRecordDetailDto.of(targetRecord, contract, leader, artist, history);
    }

    /**
     * 관리자가 실패한 온체인 작업을 수동으로 재시도합니다.
     *
     * @param recordId 재시도할 OnchainRecord의 ID
     * @return 새로 생성된 OnchainRecord의 ID
     */
    @Transactional
    public RetryResponseDto retryFailedJob(Long recordId) {
        log.info("[관리자 재시도] OnchainRecord ID {}에 대한 재시도를 시작합니다.", recordId);

        // 1. 재시도 대상 레코드를 조회합니다.
        OnchainRecord failedRecord = onchainRecordRepository.findById(recordId)
                .orElseThrow(BlockchainException::onchainRecordNotFound);

        // 2. [검증 1] 재시도 대상이 'FAILED' 상태인지 확인합니다.
        if (failedRecord.getStatus() != OnchainStatus.FAILED) {
            throw BlockchainException.cannotRetryUnfailedJob(); // 409 Conflict
        }

        // 3. [검증 2] 동일한 contractId와 actionType으로 이미 성공한 작업이 있는지 확인합니다.
        boolean alreadySucceeded = onchainRecordRepository.existsByContractIdAndActionTypeAndStatus(
                failedRecord.getContractId(),
                failedRecord.getActionType(),
                OnchainStatus.SUCCEEDED
        );

        if (alreadySucceeded) {
            throw BlockchainException.alreadySucceededJobExists(); // 409 Conflict
        }

        // 4. 재시도 로직 실행: 원본 작업의 종류에 맞는 이벤트를 다시 발행합니다.
        Long contractId = failedRecord.getContractId();

        switch (failedRecord.getActionType()) {
            case MINT -> eventPublisher.publishEvent(new ContractPaidEvent(contractId));
            case UPDATE_STATUS -> eventPublisher.publishEvent(new ContractCompletedEvent(contractId));
            case BURN -> eventPublisher.publishEvent(new ContractCanceledEvent(contractId));
            default -> throw new IllegalStateException("알 수 없는 ActionType입니다: " + failedRecord.getActionType());
        }

        log.info("[관리자 재시도] Contract ID {}에 대한 {} 이벤트를 성공적으로 다시 발행했습니다.",
                contractId, failedRecord.getActionType());

        // 5. 참고: 새로운 OnchainRecord는 이벤트 리스너(ContractCommandListener)가 생성하게 됩니다.+
        OnchainRecord newRecord = onchainRecordRepository
                .findTopByContractIdAndActionTypeOrderByIdDesc(contractId, failedRecord.getActionType())
                .orElseThrow(() -> new IllegalStateException("재시도 후 새 레코드를 찾을 수 없습니다."));

        return new RetryResponseDto(newRecord.getId());
    }
}