package com.s401.moas.contract.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.s401.moas.contract.domain.ActionLog;
import com.s401.moas.contract.repository.ActionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

/**
 * 활동 로그(ActionLog) 기록을 전담하는 서비스입니다.
 * NOTE: 현재는 Contract 도메인에서만 사용되어 임시로 이 패키지에 위치합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionLogService {

    private final ActionLogRepository actionLogRepository;
    private final ObjectMapper objectMapper; // JSON 변환을 위해 Bean으로 등록되어 있어야 합니다.

    /**
     * 활동 로그를 DB에 기록합니다.
     * 이 메서드는 호출한 쪽의 트랜잭션과 별개의 새 트랜잭션으로 실행됩니다.
     * 따라서 메인 비즈니스 로직이 롤백되더라도, 이 로그 기록은 DB에 커밋될 수 있습니다.
     *
     * @param relatedId     관련된 도메인의 ID (예: contractId)
     * @param actionType    액션 유형 (예: "CONTRACT_CANCELLATION_REQUESTED")
     * @param actorMemberId 행위자(사용자)의 ID
     * @param details       JSON으로 저장할 상세 정보
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAction(Long relatedId, String actionType, Integer actorMemberId, Map<String, Object> details) {
        try {
            String detailsJson = (details != null && !details.isEmpty()) ?
                    objectMapper.writeValueAsString(details) : null;

            ActionLog actionLog = ActionLog.builder()
                    .relatedId(relatedId)
                    .actionType(actionType)
                    .actorMemberId(actorMemberId)
                    .details(detailsJson)
                    .build();

            actionLogRepository.save(actionLog);
            log.info("액션 로그 기록 완료: relatedId={}, type={}, actorId={}", relatedId, actionType, actorMemberId);

        } catch (JsonProcessingException e) {
            // JSON 변환 실패는 심각한 문제일 수 있으므로 에러 로그를 남깁니다.
            log.error("액션 로그 'details' 필드 JSON 직렬화 실패: relatedId={}", relatedId, e);
        } catch (Exception e) {
            // 로그 기록 실패가 메인 비즈니스 로직에 영향을 주지 않도록 모든 예외를 잡고 로그만 남깁니다.
            log.error("액션 로그 기록 중 알 수 없는 오류 발생: relatedId={}", relatedId, e);
        }
    }
}