package com.s401.moas.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.global.service.LlmClient;
import com.s401.moas.project.controller.request.GenerateDescriptionRequest;
import com.s401.moas.project.controller.response.GenerateDescriptionResponse;
import com.s401.moas.project.service.assistant.ContentGuard;
import com.s401.moas.project.service.assistant.PromptBuilder;

import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 프로젝트 설명 생성 어시스턴트 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectAssistantService {

    private static final String FALLBACK_RESPONSE =
            "프로젝트 설명 생성에 실패했습니다. 입력하신 정보를 바탕으로 직접 작성해주세요.";

    private final LlmClient llmClient;
    private final PromptBuilder promptBuilder;
    private final ContentGuard contentGuard;

    @Value("${llm.max-retries:2}")
    private int maxRetries;

    /**
     * 프로젝트 설명 생성
     * 
     * @param request 설명 생성 요청
     * @return 생성된 프로젝트 설명
     */
    @Transactional(readOnly = true)
    public GenerateDescriptionResponse generateDescription(GenerateDescriptionRequest request) {
        // 권한 체크: 리더만 사용 가능
        Authentication authentication = SecurityUtil.getAuthentication();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");
        if (!MemberRole.LEADER.name().equals(role)) {
            log.warn("리더가 아닌 사용자가 프로젝트 설명 생성 시도 - role: {}", role);
            throw MemberException.invalidMemberRole();
        }

        // 감사 로그
        Integer memberId = SecurityUtil.getCurrentMemberId();
        log.info("프로젝트 설명 생성 요청 - memberId: {}, 제목: {}, 분야: {}", 
                memberId, request.getTitle(), request.getCategory());

        try {
            // 요청 검증은 @ValidDateRange 어노테이션이 처리

            // 1. 프롬프트 빌드
            String systemPrompt = promptBuilder.buildSystemPrompt();
            String userPrompt = promptBuilder.buildUserPrompt(request);

            log.debug("시스템 프롬프트 길이: {}, 사용자 프롬프트 길이: {}", 
                    systemPrompt.length(), userPrompt.length());

            // 2. LLM 호출
            String rawResponse = llmClient.generate(systemPrompt, userPrompt);

            // 3. 응답 정리 (Markdown 보존)
            String parsedResponse = normalizeResponse(rawResponse);

            // 4. 후처리 및 가드레일 적용
            GenerateDescriptionResponse response = GenerateDescriptionResponse.builder()
                    .description(parsedResponse)
                    .build();
            response = contentGuard.applyGuards(response, request);

            log.info("프로젝트 설명 생성 완료 - memberId: {}, 설명 길이: {}", 
                    memberId, response.getDescription() != null ? response.getDescription().length() : 0);

            return response;

        } catch (Exception e) {
            log.error("프로젝트 설명 생성 중 오류 발생 - memberId: {}", memberId, e);
            throw new RuntimeException("프로젝트 설명 생성에 실패했습니다: " + e.getMessage(), e);
        }
    }

    private String normalizeResponse(String rawResponse) {
        if (!StringUtils.hasText(rawResponse)) {
            return FALLBACK_RESPONSE;
        }

        String normalized = rawResponse.replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();

        if (!StringUtils.hasText(normalized)) {
            return FALLBACK_RESPONSE;
        }

        return normalized;
    }

}

