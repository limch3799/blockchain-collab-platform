package com.s401.moas.contract.service.assistant;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.s401.moas.contract.controller.response.GenerateContractResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ContractResponseParser {

    private final ObjectMapper objectMapper;
    private static final String SEPARATOR = "---CONTRACT_BODY---";

    public ContractResponseParser() {
        this.objectMapper = new ObjectMapper();
        // LocalDateTime 필드를 ISO-8601 형식 문자열에서 파싱할 수 있도록 모듈 등록
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(JsonParser.Feature.ALLOW_TRAILING_COMMA, true);
    }

    public GenerateContractResponse parseResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            log.warn("LLM 응답이 비어있습니다. 폴백 응답을 생성합니다.");
            return getFallbackResponse();
        }

        try {
            // 1. LLM이 JSON 코드 블록(```json ... ```)으로 감싸서 응답하는 경우를 대비해 순수 JSON만 추출
            String cleanedResponse = extractContent(rawResponse);

            // 2. 구분자(Separator)를 기준으로 JSON 부분과 Markdown 부분을 분리
            int separatorIndex = cleanedResponse.indexOf(SEPARATOR);

            if (separatorIndex == -1) {
                log.error("LLM 응답에 구분자('{}')가 누락되었습니다. rawResponse: {}", SEPARATOR, rawResponse);
                return getFallbackWithRawText("응답 형식 오류: 계약서 본문 구분자를 찾을 수 없습니다.\n\n" + rawResponse);
            }

            String jsonPart = cleanedResponse.substring(0, separatorIndex).trim();
            String markdownPart = cleanedResponse.substring(separatorIndex + SEPARATOR.length()).trim();

            // 3. JSON 부분만 파싱하여 메타데이터 DTO 생성
            GenerateContractResponse metadataResponse = objectMapper.readValue(jsonPart, GenerateContractResponse.class);

            // 4. 파싱된 DTO에 Markdown 본문(description)을 결합하여 최종 응답 반환
            // (GenerateContractResponse에 @Builder(toBuilder = true)가 있어야 함)
            return metadataResponse.toBuilder()
                    .description(markdownPart)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("LLM 응답의 JSON 메타데이터 파싱에 실패했습니다. rawResponse: {}", rawResponse, e);
            return getFallbackWithRawText(rawResponse);
        }
    }

    private String extractContent(String text) {
        // ```json 이나 ```로 시작하고 끝나는 부분을 제거
        String cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private GenerateContractResponse getFallbackResponse() {
        return GenerateContractResponse.builder()
                .title("계약서 생성 실패")
                .description("계약서 초안 생성에 실패했습니다. 잠시 후 다시 시도해주세요.")
                .build();
    }

    private GenerateContractResponse getFallbackWithRawText(String rawText) {
        // JSON 파싱은 실패했지만, LLM이 생성한 텍스트라도 보여주기 위한 폴백
        return GenerateContractResponse.builder()
                .title("계약서 초안 (파싱 실패)")
                .description("아래는 AI가 생성한 원본 텍스트입니다. 형식에 오류가 있을 수 있습니다.\n\n" + rawText)
                .build();
    }
}