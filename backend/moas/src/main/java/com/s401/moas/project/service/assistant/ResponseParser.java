package com.s401.moas.project.service.assistant;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * LLM 응답 파서
 */
@Slf4j
@Component
public class ResponseParser {

    // 마크다운 패턴 (화이트리스트 방식)
    private static final Pattern MARKDOWN_PATTERNS = Pattern.compile(
            "(^#+\\s+|\\*\\*|^\\s*-\\s+|^\\d+\\.\\s+|\\[.*?\\]\\(.*?\\))",
            Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);

    /**
     * LLM 응답을 순수 텍스트로 파싱
     */
    public String parseResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            log.warn("응답이 비어있습니다. 폴백 응답 반환");
            return getFallbackResponse();
        }

        try {
            // 마크다운 문법 제거 (화이트리스트 방식)
            String cleaned = removeMarkdown(rawResponse);

            // 연속된 줄바꿈 정리 (3개 이상을 2개로)
            cleaned = cleaned.replaceAll("\\n{3,}", "\n\n");

            // 앞뒤 공백 제거
            cleaned = cleaned.trim();

            if (cleaned.isEmpty()) {
                log.warn("마크다운 제거 후 응답이 비어있습니다. 폴백 응답 반환");
                return getFallbackResponse();
            }

            return cleaned;

        } catch (Exception e) {
            log.error("응답 파싱 중 오류 발생", e);
            return getFallbackResponse();
        }
    }

    /**
     * 마크다운 문법 제거 (화이트리스트 방식)
     */
    private String removeMarkdown(String text) {
        // 마크다운 패턴 제거
        String cleaned = MARKDOWN_PATTERNS.matcher(text).replaceAll("");

        // 코드 블록 제거 (```...```)
        cleaned = cleaned.replaceAll("```[\\s\\S]*?```", "");

        // 인라인 코드 제거 (`...`)
        cleaned = cleaned.replaceAll("`([^`]+)`", "$1");

        return cleaned;
    }

    /**
     * 폴백 응답 반환
     */
    private String getFallbackResponse() {
        return "프로젝트 설명 생성에 실패했습니다. 입력하신 정보를 바탕으로 직접 작성해주세요.";
    }
}

