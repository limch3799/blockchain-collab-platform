package com.s401.moas.payment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.s401.moas.application.domain.ProjectApplication;
import com.s401.moas.application.repository.ProjectApplicationRepository;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.blockchain.event.ContractPaidEvent;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.payment.controller.request.TossWebhookPayload;
import com.s401.moas.payment.domain.*;
import com.s401.moas.payment.exception.PaymentException; // PaymentException 임포트
import com.s401.moas.payment.repository.OrderRepository;
import com.s401.moas.payment.repository.PaymentRepository;
import com.s401.moas.payment.service.dto.PaymentApproveResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final ApplicationEventPublisher eventPublisher;
    private final OrderRepository orderRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentFailureLogger failureLogger;
    private final ProjectApplicationRepository applicationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${toss.payments.secret-key}")
    private String secretKey;
    @Value("${toss.payments.api-url}")
    private String tossApiUrl;

    public Order createPendingOrder(Contract contract) {
        String orderId = "MOAS_ORD_" + contract.getId() + "_" + UUID.randomUUID().toString().substring(0, 8);
        Order newOrder = Order.builder()
                .id(orderId)
                .contractId(contract.getId())
                .memberId(contract.getLeaderMemberId())
                .amount(contract.getTotalAmount())
                .build();
        return orderRepository.save(newOrder);
    }

    /**
     * 토스페이먼츠 웹훅을 받아 이벤트 타입에 따라 처리 로직을 분기합니다.
     */
    public void processWebhook(TossWebhookPayload payload) {
        if ("PAYMENT_STATUS_CHANGED".equals(payload.getEventType())) {
            TossWebhookPayload.Data data = payload.getData();
            String orderId = data.getOrderId();
            String status = data.getStatus();

            log.info("웹훅 수신: PAYMENT_STATUS_CHANGED, orderId={}, status={}", orderId, status);

            switch(status){
                case "DONE":
                    log.info("웹훅: 결제 완료(DONE) 상태 확인. orderId={}", data.getOrderId());
                    Long amount = data.getAmount();

                    if(amount == null){
                        log.error("웹훅 처리 실패: 결제 금액을 찾을 수 없습니다. orderId={}", data.getOrderId());
                        return;
                    }
                    this.approvePayment(data.getPaymentKey(), data.getOrderId(), amount);
                    break;
                case "CANCELED":
                    log.info("웹훅: 결제 취소(CANCELED) 상태 확인. orderId={}", data.getOrderId());
                    break;
                default:
                    log.warn("웹훅: 처리 대상이 아닌 결제 상태 수신. orderId={}, status={}", orderId, status);
                    break;
            }
        }else {
            log.info("웹훅 수신: Event Type={}", payload.getEventType());
        }
    }

    /**
     * 결제를 최종 승인하고, 성공 결과를 DTO로 반환합니다.
     */
    @Transactional
    public PaymentApproveResultDto approvePayment(String paymentKey, String orderId, Long amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(PaymentException::orderNotFound);

        if (order.getStatus() == OrderStatus.PAID) {
            log.info("이미 'PAID' 상태인 주문에 대한 중복 승인 요청입니다: orderId={}", orderId);
            return PaymentApproveResultDto.from(order); // 이미 성공했으므로, 현재 상태를 그대로 반환
        }

        // 금액 위변조 검증
        if (!order.getAmount().equals(amount)) {
            failureLogger.recordFailure(order.getId());
            throw PaymentException.amountMismatch();
        }

        // PENDING 상태가 아니면 (이미 FAILED 처리된 경우 등)
        if (order.getStatus() != OrderStatus.PENDING) {
            throw PaymentException.alreadyProcessedOrder();
        }

        HttpHeaders headers = createTossApiHeaders();
        Map<String, Object> requestBody = Map.of("paymentKey", paymentKey, "orderId", orderId, "amount", amount);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        String url = tossApiUrl + "/confirm";
        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, new ParameterizedTypeReference<>() {});

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> response = responseEntity.getBody();
                String status = (String) response.get("status");

                if ("DONE".equals(status)) {
                    processPaymentSuccess(order, paymentKey);
                    return PaymentApproveResultDto.from(order); // 성공 결과를 DTO로 반환
                } else {
                    // 실패 시, 실패 기록 후 예외 던지기
                    String failureMessage = (String) response.get("message");
                    failureLogger.recordFailure(order.getId());
                    throw PaymentException.paymentApprovalFailed(failureMessage);
                }
            } else {
                throw PaymentException.tossApiError();
            }
        } catch (Exception e) {
            log.error("토스페이먼츠 API 호출 중 예외 발생: {}", e.getMessage());
            failureLogger.recordFailure(order.getId());
        }
        // 실패 시 예외가 던져지므로, 이 라인에는 도달하지 않음
        return null;
    }

    private void processPaymentSuccess(Order order, String paymentKey) {
        log.info("토스페이먼츠 결제 승인 성공: orderId={}", order.getId());

        // 1. 주문 상태 변경
        order.setPaymentSuccess(paymentKey);

        // 2. 계약서 조회 및 상태 변경
        Contract contract = contractRepository.findById(order.getContractId())
                .orElseThrow(PaymentException::relatedContractNotFound);

        contract.setPaymentCompleted();

        // 3. 원본 지원서 조회 및 상태 변경
        ProjectApplication application = applicationRepository.findByContractId(contract.getId())
                .orElseThrow(() -> PaymentException.relatedApplicationNotFound(contract.getId()));

        application.complete();

        // 4. 결제 장부 기록
        Payment paymentRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(order.getMemberId())
                .amount(order.getAmount())
                .type(PaymentType.PAYMENT)
                .status(PaymentStatus.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();
        paymentRepository.save(paymentRecord);

        log.info("계약(ID: {}) 상태 PAYMENT_COMPLETED로 변경, 거래 장부 기록 완료 및 NFT 발행 이벤트", contract.getId());

        // 5. NFT 발행을 위한 이벤트 발행
        eventPublisher.publishEvent(new ContractPaidEvent(contract.getId()));
    }

    /**
     * 리더의 구매 확정 요청을 받아 내부 정산/수수료 기록을 처리합니다.
     * TODO: 테스트 환경에서 에스크로 기능이 동작하지 않아 주석처리함.
     * @param orderId 구매 확정할 주문 ID
     */
    @Transactional
    public void processPurchaseConfirmation(String orderId) {

        // 1. 주문 정보 조회 (내부 검증용)
        Order order = orderRepository.findById(orderId)
                .orElseThrow(PaymentException::orderNotFound);

        /*
        // 에스크로 구매 확정은 테스트 환경에서 동작하지 않습니다.
        log.info("PG사 에스크로 구매 확정 요청 시작: orderId={}", orderId);
        // 2. 토스페이먼츠 '구매 확정 API' 호출
        String url = tossApiUrl + "/" + order.getPaymentKey() + "/confirm";
        HttpHeaders headers = createTossApiHeaders();
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            restTemplate.postForEntity(url, requestEntity, Map.class);
            log.info("PG사 에스크로 구매 확정 API 호출 성공: orderId={}", orderId);
        } catch (HttpStatusCodeException e) {
            log.error("PG사 구매 확정 API 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            // 클라이언트에게 상세 내용을 전달하기보다, 서버에 로그를 남기고 일반적인 실패 예외를 던지는 것이 더 안전할 수 있습니다.
            throw PaymentException.tossApiError();
        } catch (Exception e) {
            log.error("PG사 API 호출 중 알 수 없는 오류 발생", e);
            throw PaymentException.tossApiError();
        }
        */

        // 3. PG사 API 호출 성공 후, 우리 DB에 정산/수수료 내역 기록
        processInternalSettlement(order);
    }

    /**
     * 구매 확정 후, 내부 회계 처리를 위한 정산 및 수수료 레코드를 생성합니다.
     * @param order 구매 확정된 주문 객체
     */
    @Transactional
    public void processInternalSettlement(Order order) {
        Contract contract = contractRepository.findById(order.getContractId())
                .orElseThrow(PaymentException::relatedContractNotFound);

        long totalAmount = order.getAmount();
        long fee = new BigDecimal(totalAmount)
                .multiply(contract.getAppliedFeeRate().movePointLeft(2))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
        long settlementAmount = totalAmount - fee;

        // a. 서비스 수수료(FEE) 기록
        Payment feeRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(0)
                .amount(fee)
                .type(PaymentType.FEE)
                .status(PaymentStatus.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();
        paymentRepository.save(feeRecord);

        // b. 아티스트 정산(SETTLEMENT) 예정 기록
        Payment settlementRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(contract.getArtistMemberId())
                .amount(settlementAmount)
                .type(PaymentType.SETTLEMENT)
                .status(PaymentStatus.PENDING) // 지급 대기 상태
                .build();
        paymentRepository.save(settlementRecord);

        log.info("구매 확정 후속 처리 완료: Fee 및 Settlement 레코드 생성. orderId={}", order.getId());
    }

    private HttpHeaders createTossApiHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.setBasicAuth(encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Idempotency-Key", UUID.randomUUID().toString());
        return headers;
    }

    /**
     * [시나리오 B] PG사에 부분 환불을 요청합니다.
     * @param orderId      환불할 주문 ID
     * @param reason       환불 사유
     * @param cancelAmount 리더에게 부분 환불할 금액
     */
    @Transactional
    public void refundPartialAmount(String orderId, String reason, Long cancelAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(PaymentException::orderNotFound);
        // 부분 환불할 금액을 파라미터로 전달
        refundPayment(order, reason, cancelAmount);
    }

    /**
     * [private] PG사에 결제 취소(환불)를 요청하는 핵심 로직입니다.
     * @param order        환불할 주문 객체
     * @param reason       환불 사유
     * @param cancelAmount 환불할 금액 (전액 또는 부분)
     */
    private void refundPayment(Order order, String reason, Long cancelAmount) {
        log.info("PG사 결제 취소(환불) 요청 시작: orderId={}, cancelAmount={}", order.getId(), cancelAmount);

        if (order.getStatus() != OrderStatus.PAID) {
            throw PaymentException.cannotCancelInvalidOrderStatus();
        }

        // 1. 토스페이먼츠 '결제 취소 API' 호출
        String url = tossApiUrl + "/" + order.getPaymentKey() + "/cancel";
        HttpHeaders headers = createTossApiHeaders();
        // Body에 'cancelAmount' 추가 (토스 API는 이 필드가 있으면 부분 취소, 없으면 전액 취소로 동작)
        Map<String, Object> requestBody = Map.of(
                "cancelReason", reason,
                "cancelAmount", cancelAmount
        );
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {} // 타입을 명확히 지정
            );
            log.info("PG사 환불 API 호출 성공: orderId={}, response={}", order.getId(), responseEntity.getBody());
        } catch (HttpStatusCodeException e) {
            handleRefundApiError(e, order); // 에러 처리 로직 분리
            return; // 상태 동기화 후 종료
        } catch (Exception e) {
            log.error("PG사 환불 API 호출 중 알 수 없는 오류 발생", e);
            throw PaymentException.tossApiError();
        }

        // 2. 주문(Order) 상태 변경
        // 전액 환불이면 CANCELED, 부분 환불이면 PARTIAL_CANCELED
        if (cancelAmount.equals(order.getAmount())) {
            order.cancel(); // 전액 취소
        } else {
            order.partialCancel();
        }

        // 3. 거래 원장(Payment)에 환불 내역 기록
        Payment refundRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(order.getMemberId()) // 리더에게 환불됨
                .amount(cancelAmount)
                .type(PaymentType.REFUND)
                .status(PaymentStatus.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();
        paymentRepository.save(refundRecord);

        log.info("환불 처리 완료: Order 상태={}, Payment에 환불 내역 기록. orderId={}", order.getStatus(), order.getId());
    }

    private void handleRefundApiError(HttpStatusCodeException e, Order order) {
        log.error("PG사 환불 API 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
        try {
            Map<String, String> errorBody = objectMapper.readValue(
                    e.getResponseBodyAsString(),
                    new TypeReference<Map<String, String>>() {}
            );
            String errorCode = errorBody.get("code");

            if ("ALREADY_CANCELED_PAYMENT".equals(errorCode)) {
                log.warn("PG사에서는 이미 취소된 결제입니다. 우리 DB 상태를 CANCELED로 동기화합니다. orderId={}", order.getId());
                if(order.getStatus() != OrderStatus.CANCELED) {
                    order.cancel();
                }
                return;
            }
        } catch (Exception parseException) {
            log.error("PG사 에러 응답 파싱 실패", parseException);
        }
        throw PaymentException.tossApiError();
    }

    /**
     * [관리자 중재용] 아티스트에게 지급할 정산 예정 레코드를 생성합니다. (수수료 없음)
     */
    @Transactional
    public void createSettlementRecordForArtist(Order order, Long settlementAmount) {
        Contract contract = contractRepository.findById(order.getContractId())
                .orElseThrow(PaymentException::relatedContractNotFound);

        Payment settlementRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(contract.getArtistMemberId())
                .amount(settlementAmount)
                .type(PaymentType.SETTLEMENT)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(settlementRecord);
        log.info("관리자 중재: 아티스트(ID: {}) 정산 예정 내역(금액: {}) 생성 완료.", contract.getArtistMemberId(), settlementAmount);
    }

    @Transactional
    public void createFeeRecord(Order order, long feeAmount, String reason) {
        Payment feeRecord = Payment.builder()
                .orderId(order.getId())
                .memberId(0)
                .amount(feeAmount)
                .type(PaymentType.FEE)
                .status(PaymentStatus.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();
        paymentRepository.save(feeRecord);
        log.info("서비스 수수료(금액: {}) 기록 완료. 사유: {}", feeAmount, reason);
    }
}