package com.s401.moas.project.service.assistant;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.s401.moas.project.controller.request.GenerateDescriptionRequest;
import com.s401.moas.project.controller.response.GenerateDescriptionResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 콘텐츠 가드레일 및 후처리
 */
@Slf4j
@Component
public class ContentGuard {

    private static final int MAX_DESCRIPTION_LENGTH = 10000;
    
    // PII 패턴
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "\\b01[016789]-?\\d{3,4}-?\\d{4}\\b");
    private static final Pattern SSN_PATTERN = Pattern.compile(
            "\\b\\d{6}-?[1-4]\\d{6}\\b");
    
    // 금지 문구 패턴 (대소문자 무시)
    private static final Pattern FORBIDDEN_PHRASES = Pattern.compile(
            "확정\\s*수익|보장(합|된)|원금\\s*보장|무조건\\s*합격",
            Pattern.CASE_INSENSITIVE);
    
    /**
     * 가드레일 적용 및 후처리
     */
    public GenerateDescriptionResponse applyGuards(
            GenerateDescriptionResponse response, 
            GenerateDescriptionRequest request) {
        
        if (response == null || response.getDescription() == null) {
            return response;
        }

        String description = response.getDescription();

        // 1. 길이 검증 및 압축
        description = validateAndTruncateLength(description);

        // 2. PII 필터링
        description = filterPII(description);

        // 3. 금지 표현 제거
        description = removeForbiddenPhrases(description);

        // 4. 형식화 (공백/중복 제거)
        description = formatContent(description);

        // 5. 섹션 누락 검사
        validateRequiredSections(description);

        response.setDescription(description);
        return response;
    }

    /**
     * 길이 검증 및 압축
     */
    private String validateAndTruncateLength(String text) {
        if (text.length() > MAX_DESCRIPTION_LENGTH) {
            log.warn("설명 길이 초과: {}자, {}자로 압축", text.length(), MAX_DESCRIPTION_LENGTH);
            String truncated = text.substring(0, MAX_DESCRIPTION_LENGTH);
            // 마지막 문장이 잘리지 않도록 처리
            int lastPeriod = truncated.lastIndexOf('.');
            if (lastPeriod > MAX_DESCRIPTION_LENGTH * 0.9) {
                truncated = truncated.substring(0, lastPeriod + 1);
            }
            return truncated;
        }
        return text;
    }

    /**
     * 민감 정보(PII) 필터링
     */
    private String filterPII(String text) {
        // 휴대전화 번호 제거
        text = PHONE_PATTERN.matcher(text).replaceAll("[연락처 제거됨]");
        
        // 주민번호 제거
        text = SSN_PATTERN.matcher(text).replaceAll("[개인정보 비공개]");
        
        return text;
    }

    /**
     * 금지 표현 제거
     */
    private String removeForbiddenPhrases(String text) {
        return FORBIDDEN_PHRASES.matcher(text).replaceAll("");
    }

    /**
     * 형식화: 연속 줄바꿈/공백 정리
     */
    private String formatContent(String text) {
        // 연속된 줄바꿈 3개 이상을 2개로
        text = text.replaceAll("\\n{3,}", "\n\n");
        
        // 연속된 공백을 하나로
        text = text.replaceAll("[ \\t]+", " ");
        
        return text.trim();
    }

    /**
     * 필수 섹션 누락 검사
     */
    private void validateRequiredSections(String text) {
        List<String> requiredSections = Arrays.asList("개요", "일정", "협업", "유의사항");
        
        boolean allPresent = requiredSections.stream()
                .allMatch(section -> text.contains(section));
        
        if (!allPresent) {
            log.warn("필수 섹션이 누락되었을 수 있습니다. 필수 섹션: {}", requiredSections);
        }
    }
}

