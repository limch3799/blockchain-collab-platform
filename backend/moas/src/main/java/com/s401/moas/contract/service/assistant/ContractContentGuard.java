package com.s401.moas.contract.service.assistant;

import com.s401.moas.contract.controller.request.GenerateContractRequest;
import com.s401.moas.contract.controller.response.GenerateContractResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Slf4j
@Component
public class ContractContentGuard {

    // 개인정보 필터링 패턴 (재사용)
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b01-?\\d{3,4}-?\\d{4}\\b");
    private static final Pattern SSN_PATTERN = Pattern.compile("\\b\\d{6}-?[1-4]\\d{6}\\b");

    // 계약서에 포함되어서는 안 될 위험한 법적 보증 문구 패턴
    private static final Pattern FORBIDDEN_LEGAL_PHRASES = Pattern.compile(
            "법적 효력을 보장|완벽하게 보호|반드시 승소|법적 책임(을|을) (모두|전부) 진다",
            Pattern.CASE_INSENSITIVE);

    public GenerateContractResponse applyGuards(GenerateContractResponse response, GenerateContractRequest request) {
        if (response == null || response.getDescription() == null) {
            return response;
        }

        String description = response.getDescription();

        // 1. 개인정보 필터링 (기존 로직 재사용)
        description = filterPII(description);

        // 2. 위험한 법적 보증 문구 제거/완화
        description = removeForbiddenPhrases(description);

        // 3. 면책 조항 포함 여부 검사 및 (없으면) 강제 추가
        description = ensureDisclaimer(description);

        return response.toBuilder()
                .description(description.trim())
                .build();
    }

    private String filterPII(String text) {
        text = PHONE_PATTERN.matcher(text).replaceAll("[연락처 제거됨]");
        text = SSN_PATTERN.matcher(text).replaceAll("[개인정보 비공개]");
        return text;
    }

    private String removeForbiddenPhrases(String text) {
        return FORBIDDEN_LEGAL_PHRASES.matcher(text).replaceAll("[과도한 법적 보증 문구 수정됨]");
    }

    private String ensureDisclaimer(String text) {
        String disclaimer = "본 계약서는 법률 자문을 대체할 수 없으며, 계약 당사자들은 서명 전 전문가의 검토를 받을 것을 권장합니다.";
        if (!text.contains("법률 자문") && !text.contains("전문가의 검토")) {
            log.warn("생성된 계약서에 면책 조항이 누락되어 강제로 추가합니다.");
            // 맨 마지막에 두 줄 띄고 추가
            return text + "\n\n" + disclaimer;
        }
        return text;
    }
}