package com.s401.moas.global.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * LLM 클라이언트 (GMS API 사용)
 */
@Slf4j
@Component
public class LlmClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;
    private final String apiUrl;
    private final int maxRetries;

    public LlmClient(
            RestTemplate restTemplate,
            @Value("${llm.gms.api-key}") String apiKey,
            @Value("${llm.gms.model:gpt-4.1}") String model,
            @Value("${llm.gms.api-url}") String apiUrl,
            @Value("${llm.max-retries:2}") int maxRetries) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = apiUrl;
        this.maxRetries = maxRetries;
        log.info("LLM 클라이언트 초기화 완료 - 모델: {}, API URL: {}", model, apiUrl);
    }

    /**
     * LLM을 사용하여 텍스트 생성
     * 
     * @param systemPrompt 시스템 프롬프트
     * @param userPrompt 사용자 프롬프트
     * @return 생성된 텍스트
     */
    @SuppressWarnings("unchecked")
    public String generate(String systemPrompt, String userPrompt) {
        int attempt = 0;

        while (attempt <= maxRetries) {
            try {
                // 요청 본문 구성 (input 배열 형식)
                Map<String, Object> requestBody = buildRequestBody(systemPrompt, userPrompt);

                // 요청 본문을 JSON 문자열로 변환
                ObjectMapper objectMapper = new ObjectMapper();
                String requestBodyJson = objectMapper.writeValueAsString(requestBody);
                
                // 로깅 (디버깅용)
                log.debug("GMS API 호출 시작 - 모델: {}, 시도: {}/{}\n요청 본문:\n{}", 
                        model, attempt + 1, maxRetries + 1, requestBodyJson);

                // HTTP 헤더 설정
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);
                
                // 헤더 로깅 (디버깅용)
                log.debug("GMS API 요청 헤더 - Content-Type: {}, Authorization: Bearer {}", 
                        headers.getContentType(), apiKey != null && !apiKey.isEmpty() ? "***" : "null");

                // JSON 문자열을 직접 전송 (Map 대신 String 사용)
                HttpEntity<String> requestEntity = new HttpEntity<>(requestBodyJson, headers);

                @SuppressWarnings("unchecked")
                ResponseEntity<Map> responseEntity = restTemplate.exchange(
                        apiUrl,
                        HttpMethod.POST,
                        requestEntity,
                        Map.class);

                // 응답 파싱
                @SuppressWarnings("unchecked")
                Map<String, Object> response = (Map<String, Object>) responseEntity.getBody();
                if (response == null) {
                    throw new RuntimeException("GMS API 응답이 비어있습니다.");
                }

                String content = extractContent(response);
                if (content == null || content.trim().isEmpty()) {
                    log.warn("GMS API 응답 내용이 비어있습니다. 폴백 응답 반환");
                    return getFallbackResponse();
                }

                log.debug("GMS API 응답 수신 완료 - 응답 길이: {}", content.length());
                return content;

            } catch (HttpClientErrorException e) {
                // 4xx 오류는 재시도 금지
                String responseBody = e.getResponseBodyAsString();
                log.error("GMS API 클라이언트 오류 (4xx) - 시도: {}/{}, 상태: {}, 응답 본문: {}", 
                        attempt + 1, maxRetries + 1, e.getStatusCode(), responseBody);
                throw new RuntimeException("GMS API 호출 실패: " + e.getMessage(), e);
            } catch (HttpServerErrorException e) {
                // 5xx 오류는 재시도
                log.warn("GMS API 서버 오류 (5xx) - 시도: {}/{}, 상태: {}, 메시지: {}", 
                        attempt + 1, maxRetries + 1, e.getStatusCode(), e.getMessage());
            } catch (RestClientException e) {
                // 네트워크 오류 등은 재시도
                log.warn("GMS API 호출 중 오류 - 시도: {}/{}, 메시지: {}", 
                        attempt + 1, maxRetries + 1, e.getMessage());
            } catch (Exception e) {
                log.error("GMS API 호출 중 예상치 못한 오류 - 시도: {}/{}", 
                        attempt + 1, maxRetries + 1, e);
            }

            attempt++;
            if (attempt <= maxRetries) {
                long delayMs = (long) Math.pow(2, attempt - 1) * 500; // 지수 백오프: 500ms → 1s → 2s
                log.info("{}ms 후 재시도...", delayMs);
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("재시도 중 인터럽트 발생", ie);
                }
            }
        }

        // 최대 재시도 횟수 초과
        log.error("GMS API 호출 실패 (최대 재시도 횟수 초과)");
        return getFallbackResponse();
    }

    /**
     * 요청 본문 구성
     * GMS API chat/completions 엔드포인트 형식 사용
     * messages 배열에 role과 content를 문자열로 전달
     */
    private Map<String, Object> buildRequestBody(String systemPrompt, String userPrompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        // messages 배열 형식 구성
        List<Map<String, Object>> messages = new ArrayList<>();

        // developer 역할로 시스템 프롬프트 전달
        Map<String, Object> developerMessage = new HashMap<>();
        developerMessage.put("role", "developer");
        developerMessage.put("content", systemPrompt);
        messages.add(developerMessage);

        // user 역할로 사용자 프롬프트 전달
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", userPrompt);
        messages.add(userMessage);

        requestBody.put("messages", messages);
        
        // temperature, top_p, max_tokens 추가
        requestBody.put("temperature", 0.4);
        requestBody.put("top_p", 0.9);
        requestBody.put("max_tokens", 4000);

        return requestBody;
    }

    /**
     * 응답에서 텍스트 추출
     */
    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        try {
            // GMS API 응답 구조에 맞춰 파싱
            // 실제 응답 구조를 확인 후 조정 필요
            if (response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    if (firstChoice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message.containsKey("content")) {
                            return (String) message.get("content");
                        }
                    }
                    if (firstChoice.containsKey("text")) {
                        return (String) firstChoice.get("text");
                    }
                }
            }
            if (response.containsKey("text")) {
                return (String) response.get("text");
            }
            if (response.containsKey("content")) {
                return (String) response.get("content");
            }
            return null;
        } catch (Exception e) {
            log.error("응답 파싱 중 오류 발생", e);
            return null;
        }
    }

    /**
     * 폴백 응답 반환
     */
    private String getFallbackResponse() {
        return "AI 응답 생성에 실패했습니다. 입력하신 정보를 바탕으로 직접 작성해주세요.";
    }
}

