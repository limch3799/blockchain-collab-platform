package com.s401.moas.contract.service;

import com.s401.moas.admin.feepolicy.repository.FeePolicyRepository;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.exception.ApplicationException;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.blockchain.config.Eip712Properties;
import com.s401.moas.blockchain.domain.ActionType;
import com.s401.moas.blockchain.domain.ContractNft;
import com.s401.moas.blockchain.domain.OnchainRecord;
import com.s401.moas.blockchain.domain.OnchainStatus;
import com.s401.moas.blockchain.event.ContractCompletedEvent;
import com.s401.moas.blockchain.repository.ContractNftRepository;
import com.s401.moas.blockchain.repository.OnchainRecordRepository;
import com.s401.moas.contract.controller.request.ContractUpdateRequest;
import com.s401.moas.contract.controller.response.TypedDataResponse;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ActionLogRepository;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.contract.service.dto.*;
import com.s401.moas.global.util.BlockExplorerUtil;
import com.s401.moas.global.util.PageInfo;
import com.s401.moas.global.util.SignatureVerifier;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;
import com.s401.moas.notification.service.NotificationService;
import com.s401.moas.payment.domain.Order;
import com.s401.moas.payment.domain.OrderStatus;
import com.s401.moas.payment.exception.PaymentException;
import com.s401.moas.payment.repository.OrderRepository;
import com.s401.moas.payment.service.PaymentService;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.exception.ProjectException;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    @Value("${blockchain.contract.moas-address}")
    private String moasContractAddress;

    private final ApplicationEventPublisher applicationEventPublisher;
    private final ContractRepository contractRepository;
    private final Eip712Properties eip712Properties;
    private final ProjectApplicationRepository applicationRepository;
    private final SignatureVerifier signatureVerifier;
    private final PaymentService paymentService;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final OrderRepository orderRepository;
    private final ActionLogService actionLogService;
    private final BlockExplorerUtil blockExplorerUtil;
    private final ProjectPositionRepository projectPositionRepository;
    private final OnchainRecordRepository onchainRecordRepository;
    private final ContractNftRepository contractNftRepository;
    private final FeePolicyRepository feePolicyRepository;
    private final NotificationService notificationService;

    @Transactional
    public ContractOfferResponseDto offerContract(Long applicationId, Integer leaderMemberId, String title,
                                                  String description, LocalDateTime startAt, LocalDateTime endAt,
                                                  Long totalAmount) {
        // 1. 지원서 조회 (404 Not Found: 없거나 지원자가 취소한 경우)
        ProjectApplication application = applicationRepository.findByIdAndDeletedAtIsNull(applicationId)
                .orElseThrow(ApplicationException::applicationNotFound);

        // 2. 권한 검증: 요청자가 해당 프로젝트의 리더인지 확인 (403 Forbidden)
        ProjectPosition projectPosition = projectPositionRepository.findByIdAndDeletedAtIsNull(application.getProjectPositionId())
                .orElseThrow(()-> ProjectException.projectPositionNotFound(null));
        Project project = projectRepository.findById(projectPosition.getProjectId())
                .orElseThrow(()-> ProjectException.projectNotFound(projectPosition.getProjectId()));

        if (!project.getMemberId().equals(leaderMemberId)) {
            throw ApplicationException.notProjectLeader();
        }

        // 3. 계약서 엔티티 생성
        BigDecimal feeRate = feePolicyRepository.findCurrentFeeRate(LocalDateTime.now())
                .orElse(new BigDecimal("5.0")) // 정책 없을 때 기본값
                .setScale(2, RoundingMode.HALF_UP);


        Contract newContract = Contract.builder()
                .projectId(project.getId())
                .leaderMemberId(leaderMemberId)
                .artistMemberId(application.getMemberId())
                .title(title)
                .description(description)
                .startAt(startAt)
                .endAt(endAt)
                .totalAmount(totalAmount)
                .appliedFeeRate(feeRate)
                .build();

        // 4. 계약서 저장
        Contract savedContract = contractRepository.save(newContract);

        // 5. 지원서 상태를 OFFERED로 변경 (내부적으로 409 Conflict 검증)
        application.offer(savedContract.getId());

        // [알림] 아티스트에게 계약 제안 알림
        try {
            notificationService.createNotification(
                    savedContract.getArtistMemberId(),
                    "CONTRACT_OFFERED",
                    savedContract.getId()
            );
        } catch (Exception e) {
            log.error("계약 제안 알림 전송 실패: contractId={}, artistMemberId={}",
                    savedContract.getId(), savedContract.getArtistMemberId(), e);
        }

        // 6. 결과 DTO 생성 및 반환
        return ContractOfferResponseDto.of(savedContract, application.getId(), application.getStatus());
    }

    public ContractDetailDto getContractDetails(Long contractId, Integer memberId) {
        // 1. JPQL 프로젝션 쿼리를 통해 ContractDetailDto의 대부분 정보 조회
        ContractDetailDto contractDetailDto = contractRepository.findContractDetailProjectionById(contractId)
                .orElseThrow(ContractException::contractNotFound); // 404 Not Found

        // 2. 권한 검증 (프로젝션 DTO에서 leaderId와 artistId를 가져와 사용)
        if (!contractDetailDto.getLeaderId().equals(memberId) && !contractDetailDto.getArtistId().equals(memberId)) {
            throw ContractException.contractAccessDenied(); // 403 Forbidden
        }

        // 3. NFT 정보는 별도로 조회하여 DTO에 추가
        ContractDetailDto.ContractDetailDtoBuilder builder = contractDetailDto.toBuilder(); // Lombok의 toBuilder() 사용

        List<ContractStatus> nftRelatedStatuses = Arrays.asList(
                ContractStatus.PAYMENT_COMPLETED,
                ContractStatus.COMPLETED,
                ContractStatus.CANCELLATION_REQUESTED
        );

        if (nftRelatedStatuses.contains(contractDetailDto.getStatus())) {

            Optional<ContractNft> anyNft = contractNftRepository.findFirstByContractId(contractId);

            if (anyNft.isPresent()) {
                ContractNft nft = anyNft.get();
                builder.onchainStatus(OnchainStatus.SUCCEEDED.name())
                        .nftTokenId(nft.getContractId().toString())
                        .nftMintTxHash(nft.getMintTxHash())
                        .nftExplorerUrl(blockExplorerUtil.buildNftUrl(nft.getContractId()));

            } else {
                Optional<OnchainRecord> mintRecordOpt = onchainRecordRepository
                        .findTopByContractIdAndActionTypeOrderByIdDesc(contractId, ActionType.MINT);

                if (mintRecordOpt.isPresent()) {
                    OnchainRecord mintRecord = mintRecordOpt.get();
                    builder.onchainStatus(mintRecord.getStatus().name());
                } else {
                    builder.onchainStatus("WAITING_FOR_PROCESS");
                }
            }
        }
        return builder.build(); // NFT 정보가 추가된 DTO 반환
    }

    /**
     * 아티스트가 제시된 계약을 거절합니다.
     *
     * @param contractId     거절할 계약서 ID
     * @param artistMemberId 요청한 회원 ID (계약 대상 아티스트)
     * @return 상태가 변경된 계약 정보 DTO
     */
    @Transactional
    public ContractStatusUpdateDto declineContract(Long contractId, Integer artistMemberId) {
        // 1. 계약서 조회 (404 Not Found)
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // 2. 권한 검증: 요청자가 해당 계약의 아티스트인지 확인 (403 Forbidden)
        if (!contract.getArtistMemberId().equals(artistMemberId)) {
            throw ContractException.contractAccessDenied();
        }

        // 3. 엔티티의 비즈니스 메서드 호출 (상태 변경 및 409 Conflict 검증)
        contract.decline();

        // [알림] 리더에게 계약 거절 알림
        try {
            notificationService.createNotification(
                    contract.getLeaderMemberId(),
                    "CONTRACT_DECLINED",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("계약 거절 알림 전송 실패: contractId={}, leaderMemberId={}",
                    contract.getId(), contract.getLeaderMemberId(), e);
        }

        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * 리더가 거절된 계약을 수정하여 재제시합니다.
     *
     * @param contractId     수정할 계약서 ID
     * @param leaderMemberId 요청한 회원 ID (프로젝트 리더)
     * @param request        변경할 계약 내용을 담은 DTO
     * @return 상태가 변경된 계약 정보 DTO
     */
    @Transactional
    public ContractStatusUpdateDto reofferContract(Long contractId, Integer leaderMemberId, ContractUpdateRequest request) {
        // 1. 계약서 조회 (404 Not Found)
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // 2. 권한 검증: 요청자가 해당 계약의 리더인지 확인 (403 Forbidden)
        if (!contract.getLeaderMemberId().equals(leaderMemberId)) {
            throw ContractException.contractAccessDenied(); // 기존 예외 재사용
        }

        // 3. 엔티티의 비즈니스 메서드 호출 (부분 업데이트, 상태 변경, 409 Conflict 검증)
        contract.updateAndReoffer(request);

        // [알림] 아티스트에게 계약 재제안 알림
        try {
            notificationService.createNotification(
                    contract.getArtistMemberId(),
                    "CONTRACT_REOFFERED",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("계약 재-제안 알림 전송 실패: contractId={}, artistMemberId={}",
                    contract.getId(), contract.getArtistMemberId(), e);
        }

        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * 리더가 계약 제안을 철회합니다.
     *
     * @param contractId     철회할 계약서 ID
     * @param leaderMemberId 요청한 회원 ID (프로젝트 리더)
     * @return 상태가 변경된 계약 정보 DTO
     */
    @Transactional
    public ContractStatusUpdateDto withdrawContract(Long contractId, Integer leaderMemberId) {
        // 1. 계약서 조회 (404 Not Found)
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // 2. 권한 검증: 요청자가 해당 계약의 리더인지 확인 (403 Forbidden)
        if (!contract.getLeaderMemberId().equals(leaderMemberId)) {
            throw ContractException.contractAccessDenied();
        }

        // 3. 엔티티의 비즈니스 메서드 호출 (상태 변경 및 409 Conflict 검증)
        contract.withdraw();

        // 4. 계약 철회 시, 관련된 원본 지원서의 상태를 변경
        ProjectApplication application = applicationRepository.findByContractId(contractId)
                .orElseThrow(() -> PaymentException.relatedApplicationNotFound(contractId));
        application.rejectFromOffered(); // '제안 철회로 인한 거절' 처리

        log.info("계약(ID: {}) 철회에 따라 지원서(ID: {}) 상태를 REJECTED로 변경했습니다.", contract.getId(), application.getId());

        // [알림] 아티스트에게 계약 제안 철회 알림
        try {
            notificationService.createNotification(
                    contract.getArtistMemberId(),
                    "CONTRACT_WITHDRAWN",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("계약 철회 알림 전송 실패: contractId={}, artistMemberId={}",
                    contract.getId(), contract.getArtistMemberId(), e);
        }

        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * EIP-712 서명을 위한 구조화된 데이터를 생성합니다.
     *
     * @param contractId 대상 계약 ID
     * @param memberId   요청자 ID (권한 검증용)
     * @return EIP-712 TypedData 형식의 DTO
     */
    public TypedDataResponse getSignatureData(Long contractId, Integer memberId) {
        // 1. 계약서 및 권한 검증
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);
        if (!contract.getLeaderMemberId().equals(memberId) && !contract.getArtistMemberId().equals(memberId)) {
            throw ContractException.contractAccessDenied();
        }

        Member leader = memberRepository.findById(contract.getLeaderMemberId())
                .orElseThrow(MemberException::memberNotFound);
        Member artist = memberRepository.findById(contract.getArtistMemberId())
                .orElseThrow(MemberException::memberNotFound);

        String leaderAddress = leader.getWalletAddress();
        String artistAddress = artist.getWalletAddress();

        // 3. EIP-712 데이터 구조 생성
        byte[] descriptionBytes = contract.getDescription().getBytes(StandardCharsets.UTF_8);
        byte[] descriptionHashBytes = Hash.sha3(descriptionBytes);
        String descriptionHash = Numeric.toHexString(descriptionHashBytes);

        // Domain
        TypedDataResponse.Domain domain = TypedDataResponse.Domain.builder()
                .name(eip712Properties.getDomain().getName())
                .version(eip712Properties.getDomain().getVersion())
                .chainId(eip712Properties.getChainId())
                .verifyingContract(eip712Properties.getVerifyingContract())
                .build();

        // Types
        List<TypedDataResponse.Type> eip712DomainType = List.of(
                TypedDataResponse.Type.builder().name("name").type("string").build(),
                TypedDataResponse.Type.builder().name("version").type("string").build(),
                TypedDataResponse.Type.builder().name("chainId").type("uint256").build(),
                TypedDataResponse.Type.builder().name("verifyingContract").type("address").build()
        );

        // Solidity: "ContractSignature(...)"
        List<TypedDataResponse.Type> contractSignatureType = List.of(
                TypedDataResponse.Type.builder().name("tokenId").type("uint256").build(),
                TypedDataResponse.Type.builder().name("title").type("string").build(),
                TypedDataResponse.Type.builder().name("descriptionHash").type("bytes32").build(),
                TypedDataResponse.Type.builder().name("leader").type("address").build(),
                TypedDataResponse.Type.builder().name("artist").type("address").build(),
                TypedDataResponse.Type.builder().name("totalAmount").type("uint256").build(),
                TypedDataResponse.Type.builder().name("startsAt").type("string").build(),
                TypedDataResponse.Type.builder().name("endsAt").type("string").build()
        );

        Map<String, List<TypedDataResponse.Type>> types = Map.of(
                "EIP712Domain", eip712DomainType,
                "ContractSignature", contractSignatureType
        );

        // Message
        TypedDataResponse.Message message = TypedDataResponse.Message.builder()
                .tokenId(String.valueOf(contract.getId())) // DB의 contract.id를 tokenId로 사용
                .title(contract.getTitle())
                .descriptionHash(descriptionHash)
                .leader(leaderAddress)
                .artist(artistAddress)
                .totalAmount(String.valueOf(contract.getTotalAmount()))
                .startsAt(contract.getStartAt().toString())
                .endsAt(contract.getEndAt().toString())
                .build();

        // 최종 TypedData 객체 반환
        return TypedDataResponse.builder()
                .domain(domain)
                .types(types)
                .primaryType("ContractSignature")
                .message(message)
                .build();
    }

    /**
     * 아티스트가 제시된 계약을 수락하고 서명을 제출합니다.
     *
     * @param contractId     수락할 계약서 ID
     * @param artistMemberId 요청한 회원 ID (계약 대상 아티스트)
     * @param artistSignature 아티스트의 EIP-712 서명값
     * @return 상태가 변경된 계약 정보 DTO
     */
    @Transactional
    public ContractStatusUpdateDto acceptContract(Long contractId, Integer artistMemberId, String artistSignature) {
        // 1. 계약서 조회
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // 2. 권한 검증: 요청자가 해당 계약의 아티스트인지 확인
        if (!contract.getArtistMemberId().equals(artistMemberId)) {
            throw ContractException.contractAccessDenied();
        }

        // 3. 서명 유효성 검증
        // a. 서명에 사용되었을 원본 TypedData를 다시 생성합니다.
        // getSignatureData는 권한 검증을 포함하므로 memberId를 그대로 전달합니다.
        TypedDataResponse originalTypedData = this.getSignatureData(contractId, artistMemberId);

        // b. MemberRepository를 통해 artistMemberId의 지갑 주소를 조회합니다.
        Member artist = memberRepository.findById(contract.getArtistMemberId())
                .orElseThrow(MemberException::memberNotFound);
        String artistWalletAddress = artist.getWalletAddress();

        // c. SignatureVerifier를 사용하여 서명을 검증합니다.
        boolean isSignatureValid = signatureVerifier.verify(artistWalletAddress, originalTypedData, artistSignature);
        // d. 검증 실패 시 예외를 발생시킵니다.
        if (!isSignatureValid) {
            throw ContractException.signatureInvalid();
        }

        // 4. 엔티티의 비즈니스 메서드 호출 (상태 변경 및 409 Conflict 검증)
        contract.accept(artistSignature);

        // [알림] 리더에게 아티스트가 계약에 서명했음을 알림
        try {
            notificationService.createNotification(
                    contract.getLeaderMemberId(),
                    "CONTRACT_ACCEPTED_BY_ARTIST",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("계약 수락 알림 전송 실패: contractId={}, leaderMemberId={}",
                    contract.getId(), contract.getLeaderMemberId(), e);
        }

        return ContractStatusUpdateDto.from(contract);
    }

    /**
     * 리더가 계약을 최종 체결하고 결제를 준비합니다.
     *
     * @param contractId     체결할 계약서 ID
     * @param leaderMemberId 요청한 회원 ID (프로젝트 리더)
     * @param leaderSignature 리더의 EIP-712 서명값
     * @return 상태 변경 및 결제 정보가 포함된 DTO
     */
    @Transactional
    public ContractFinalizeResponseDto finalizeContract(Long contractId, Integer leaderMemberId, String leaderSignature, String nftImageUrl) {
        // 1. 계약서 조회 및 리더 권한 검증
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);
        if (!contract.getLeaderMemberId().equals(leaderMemberId)) {
            throw ContractException.contractAccessDenied();
        }

        // 2. 리더 서명 유효성 검증
        TypedDataResponse originalTypedData = this.getSignatureData(contractId, leaderMemberId);
        Member leader = memberRepository.findById(leaderMemberId)
                .orElseThrow(MemberException::memberNotFound);

        String leaderWalletAddress = leader.getWalletAddress();
        boolean isSignatureValid = signatureVerifier.verify(leaderWalletAddress, originalTypedData, leaderSignature);
        if (!isSignatureValid) {
            throw ContractException.signatureInvalid();
        }

        // 3. 엔티티의 비즈니스 메서드 호출 (상태 변경 및 409 Conflict 검증)
        contract.finalizeContract(leaderSignature);

        // 4. 프론트엔드로부터 받은 NFT 이미지 URL을 엔티티에 저장합니다.
        contract.setNftImageUrl(nftImageUrl);
        log.info("계약 ID {}에 대한 NFT 이미지 URL 저장 완료: {}", contractId, nftImageUrl);

        // --- 5. 실제 PaymentService를 호출하여 결제 주문 생성 ---
        // 5-1 (멱등성 추가) 해당 계약에 대해 이미 'PENDING' 상태 주문이 있는지 확인
        Optional<Order> existingPendingOrder = orderRepository.findFirstByContractIdAndStatusOrderByCreatedAtDesc(contractId, OrderStatus.PENDING);

        Order orderToPay;

        if(existingPendingOrder.isPresent()){
            // 이미 PENDING 주문이 있다면 재사용
            log.info("기존 PENDING 주문 재사용: orderId={}", existingPendingOrder.get().getId());
            orderToPay = existingPendingOrder.get();
        } else{
            log.info("새로운 PENDING 주문 생성: contractId={}", contract.getId());
            orderToPay = paymentService.createPendingOrder(contract);
        }

        // 6. 프론트엔드에 전달할 결제 정보 DTO 생성
        ContractFinalizeResponseDto.PaymentInfo paymentInfo = ContractFinalizeResponseDto.PaymentInfo.builder()
                .orderId(orderToPay.getId())
                .amount(orderToPay.getAmount())
                .productName(contract.getTitle())
                // TODO: 실제 결제 진행할 때는 사용자 실명 필요
                .customerName(leader.getNickname())
                .build();

        return ContractFinalizeResponseDto.builder()
                .contractId(contract.getId())
                .status(contract.getStatus())
                .paymentInfo(paymentInfo)
                .build();
    }

    /**
     * 리더의 구매 확정 요청을 처리합니다. (정산)
     * @param contractId     구매 확정할 계약 ID
     * @param leaderMemberId 요청한 리더의 ID
     * @return 상태가 변경된 계약 정보 DTO
     */
    @Transactional
    public ContractStatusUpdateDto confirmPaymentAndTriggerSettlement(Long contractId, Integer leaderMemberId) {
        // --- 1. 검증 절차 ---
        log.info("계약 구매 확정 프로세스 시작: contractId={}, leaderId={}", contractId, leaderMemberId);
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        // a. 요청자가 리더인지 확인
        if (!contract.getLeaderMemberId().equals(leaderMemberId)) {
            throw ContractException.contractAccessDenied();
        }

        processContractCompletion(contractId);

        Contract updatedContract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        return ContractStatusUpdateDto.from(updatedContract);
    }

    @Transactional
    public void processContractCompletion(Long contractId){
        // 1. 계약이 '결제 완료' 상태인지 확인 (우리 시스템 내부 상태 기준)
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        if (contract.getStatus() != ContractStatus.PAYMENT_COMPLETED) {
            throw ContractException.cannotConfirmInvalidStatus();
        }

        // 2. 관련 주문(Order) 정보 조회
        Order order = orderRepository.findFirstByContractIdAndStatusOrderByCreatedAtDesc(contract.getId(), OrderStatus.PAID)
                .orElseThrow(PaymentException::orderNotFound);

        // 3. PaymentService를 통해 PG사 구매 확정 요청 및 내부 정산 처리
        //    (이 메서드 내부에서 실패 시 예외가 발생하여 롤백됨)
        paymentService.processPurchaseConfirmation(order.getId());

        // 4. 모든 오프체인 작업 성공 후, 계약 상태를 'COMPLETED'로 변경
        contract.complete();

        applicationEventPublisher.publishEvent(new ContractCompletedEvent(contract.getId()));

        // [알림] 아티스트에게 프로젝트 완료 및 정산 시작 알림
        try {
            notificationService.createNotification(
                    contract.getArtistMemberId(),
                    "PROJECT_COMPLETED",
                    contract.getId()
            );
        } catch (Exception e) {
            log.error("프로젝트 완료 알림 전송 실패: contractId={}, artistMemberId={}",
                    contract.getId(), contract.getArtistMemberId(), e);
        }

        log.info("계약 구매 확정 프로세스 성공: contractId={}, newStatus={}", contract.getId(), contract.getStatus());
    }

    /**
     * [사용자] 계약 취소를 요청합니다.
     */
    @Transactional
    public ContractStatusUpdateDto requestContractCancellation(Long contractId, Integer memberId, String reason) {
        log.info("계약 취소 요청 처리 시작: contractId={}, memberId={}", contractId, memberId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(ContractException::contractNotFound);

        if (!contract.getLeaderMemberId().equals(memberId) && !contract.getArtistMemberId().equals(memberId)) {
            throw ContractException.contractAccessDenied();
        }

        contract.requestCancellation();

        actionLogService.recordAction(
                contract.getId(), "CONTRACT_CANCELLATION_REQUESTED", memberId, Map.of("reason", reason));

        // [알림] 요청자 반대편에게 계약 취소 요청 알림
        try {
            // 요청자가 리더이면 아티스트에게 알림
            if (memberId.equals(contract.getLeaderMemberId())) {
                notificationService.createNotification(
                        contract.getArtistMemberId(),
                        "CANCELLATION_REQUESTED_BY_LEADER",
                        contract.getId()
                );
                // 요청자가 아티스트이면 리더에게 알림
            } else if (memberId.equals(contract.getArtistMemberId())) {
                notificationService.createNotification(
                        contract.getLeaderMemberId(),
                        "CANCELLATION_REQUESTED_BY_ARTIST",
                        contract.getId()
                );
            }
        } catch (Exception e) {
            log.error("계약 취소 요청 알림 전송 실패: contractId={}, requestMemberId={}",
                    contract.getId(), memberId, e);
        }

        log.info("계약 취소 요청 처리 성공: contractId={}, newStatus={}", contract.getId(), contract.getStatus());
        return ContractStatusUpdateDto.from(contract);
    }

    public MyContractListDto findMyContracts(int memberId, ContractViewStatus viewStatus, Pageable pageable) {
        String statusFilter = (viewStatus != null) ? viewStatus.name() : null;
        Page<ContractItemDto> pageResult = contractRepository.findMyContracts(memberId, statusFilter, pageable);

        // DTO 목록을 NFT 정보로 채움
        List<ContractItemDto> enrichedContracts = enrichContractsWithNftInfo(pageResult.getContent());

        PageInfo pageInfo = PageInfo.from(pageResult);
        return new MyContractListDto(enrichedContracts, pageInfo);
    }

    public MyContractListDto findMyCanceledContracts(int memberId, ContractStatus contractStatus, Pageable pageable) {
        Page<ContractItemDto> pageResult = contractRepository.findMyCanceledContracts(memberId, contractStatus, pageable);

        // DTO 목록을 NFT 정보로 채움
        List<ContractItemDto> enrichedContracts = enrichContractsWithNftInfo(pageResult.getContent());

        PageInfo pageInfo = PageInfo.from(pageResult);
        return new MyContractListDto(enrichedContracts, pageInfo);
    }

    private List<ContractItemDto> enrichContractsWithNftInfo(List<ContractItemDto> contracts) {
        if (contracts.isEmpty()) {
            return contracts;
        }

        // 1. contractId 목록 추출
        List<Long> contractIds = contracts.stream()
                .map(ContractItemDto::getContractId)
                .collect(Collectors.toList());

        // 2. Nft가 발행된 계약 정보 조회 (1번의 쿼리)
        Map<Long, ContractNft> nftMap = contractNftRepository.findByContractIdIn(contractIds).stream()
                .collect(Collectors.toMap(
                        ContractNft::getContractId,
                        nft -> nft,
                        (existingNft, newNft) -> existingNft
                ));
        // 3. OnchainRecord에 기록이 있는 계약 정보 조회 (1번의 쿼리)
        Map<Long, OnchainRecord> onchainRecordMap = onchainRecordRepository.findByContractIdInAndActionType(contractIds, ActionType.MINT).stream()
                // 혹시 모를 중복에 대비해 최신 ID를 가진 기록만 남김
                .collect(Collectors.toMap(
                        OnchainRecord::getContractId,
                        record -> record,
                        (existing, replacement) -> existing.getId() > replacement.getId() ? existing : replacement
                ));

        // 4. 원본 DTO 목록을 순회하며 데이터 조합
        return contracts.stream()
                .map(contract -> {
                    ContractItemDto.NftInfo nftInfo = null;
                    if (nftMap.containsKey(contract.getContractId())) {
                        // case 1: NFT 발행 성공
                        ContractNft nft = nftMap.get(contract.getContractId());
                        nftInfo = ContractItemDto.NftInfo.builder()
                                .onchainStatus("SUCCEEDED") // ContractNft 테이블에 있으면 성공
                                .tokenId(nft.getContractId().toString())
                                .explorerUrl(blockExplorerUtil.buildNftUrl(nft.getContractId()))
                                .build();
                    } else if (onchainRecordMap.containsKey(contract.getContractId())) {
                        // case 2: NFT 발행 시도 기록 있음 (PENDING or FAILED)
                        OnchainRecord record = onchainRecordMap.get(contract.getContractId());
                        nftInfo = ContractItemDto.NftInfo.builder()
                                .onchainStatus(record.getStatus().name())
                                .build();
                    } else {
                        // case 3: 아직 NFT 발행 처리 시작 전
                        // nftInfo는 null 그대로 유지
                    }

                    // toBuilder()로 기존 DTO를 복사하고 nftInfo만 새로 설정하여 반환
                    return contract.toBuilder().nftInfo(nftInfo).build();
                })
                .collect(Collectors.toList());
    }
}