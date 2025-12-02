package com.s401.moas.contract.service.assistant;

import com.s401.moas.contract.controller.request.GenerateContractRequest;
import com.s401.moas.project.domain.Position;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class ContractPromptBuilder {

    // Position, Project Repository 등 의존성 주입
    private final PositionRepository positionRepository;
    private final ProjectRepository projectRepository;
    private static final DateTimeFormatter JSON_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public String buildSystemPrompt() {
        return """
        당신은 대한민국 상법 및 저작권법에 능통한 엔터테인먼트/예술 분야 전문 변호사입니다. 당신의 임무는 프로젝트 리더와 아티스트 간의 표준 용역 계약서 초안을 작성하는 것입니다.

        **규칙:**
        1.  제공된 정보를 바탕으로, 각 항목을 법률적으로 명확하고 **Markdown 형식을 사용**하여 가독성 높게 작성합니다. (예: 제목은 ##, 목록은 *)
        2.  모든 결과물은 반드시 **지정된 2-Part 형식**으로만 응답해야 합니다.
            - Part 1: 계약 메타데이터 (순수 JSON 객체)
            - Part 2: ---CONTRACT_BODY--- 구분자
            - Part 3: 계약서 본문 (순수 Markdown 텍스트)
        3. 아래와 같은 스마트 플레이스홀더를 사용하여 사용자의 입력을 유도하고 계약의 완성도를 높이세요.
      - `{구체적인 결과물 명시: 예시) 3분 내외의 BGM 음원 1곡(mp3, wav 포맷), 앨범 커버 아트워크 이미지 1종(3000x3000px, jpg, psd 포맷)}`
      - `{결과물 수정 횟수 및 범위: 예시) 총 2회에 한하며, 수정 범위는 색상, 폰트, 믹싱 밸런스 등 경미한 조정에 한정됨.}`
      - `{저작권 귀속 주체 및 이용 허락 범위: 예시) 결과물에 대한 저작재산권은 '갑'(리더)과 '을'(아티스트)이 공동으로 소유한다.}`
        4.  계약서 본문 마지막에는 "본 계약서는 법률 자문을 대체할 수 없으며, 계약 당사자들은 서명 전 전문가의 검토를 받을 것을 권장합니다." 라는 면책 조항을 **Markdown 단락**으로 반드시 포함해야 합니다.
        """;
    }

    public String buildUserPrompt(GenerateContractRequest request, Project project, ProjectPosition projectPosition) {
        // DB에서 포지션 이름 등 추가 정보 조회
        String positionName = positionRepository.findById(projectPosition.getPositionId())
                .map(Position::getPositionName).orElse("미지정 포지션");

        // 날짜 형식화
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일");
        String startDate = request.getStartAt().format(formatter);
        String endDate = request.getEndAt().format(formatter);

        String jsonStartAt = request.getStartAt().withNano(0).format(JSON_DATE_FORMATTER);
        String jsonEndAt = request.getEndAt().withNano(0).format(JSON_DATE_FORMATTER);

        return String.format("""
        아래 정보를 바탕으로 표준 용역 계약서 초안을 지시한 2-Part 형식(JSON + Markdown)으로 작성해주세요.
        **계약 핵심 정보:**
        - 계약서 제목: %s
        - 원본 프로젝트 제목: %s
        - 원본 프로젝트 요약: %s
        - 대상 포지션: %s
        - 총 계약 금액 (세전): %,d 원
        - 계약 기간: %s ~ %s

        **사용자 추가 요청사항:**
        %s
  
        **플랫폼 정산 시스템에 대한 중요 정보:**
        - 본 계약의 대금 지급은 'MOAS' 플랫폼의 안전 결제(에스크로) 시스템을 통해 이루어집니다.
        - 계약 체결 시 '갑'(리더)이 총 계약금액을 플랫폼에 예치합니다.
        - 예치된 금액은 계약 기간이 종료되고 '갑'이 최종 결과물에 대한 '구매 확정'을 했을 때, 플랫폼 수수료를 제외한 금액이 '을'(아티스트)에게 일괄 정산됩니다.
        - 따라서, 계약서 내에 선급금, 중도금, 잔금과 같은 분할 지급 조항을 절대 작성하지 마세요. '계약 금액 및 지급 방법' 조항에는 위 내용을 반영하여 "플랫폼의 정산 절차에 따라 최종 검수 완료 후 지급된다"는 점을 명시해야 합니다.

        **생성할 계약서에 포함될 필수 조항 목록:**
        1.  계약 당사자 ('갑'과 '을'의 정보 기입란)
        2.  계약의 목적 (프로젝트 및 역할 명시)
        3.  용역의 범위 및 내용 (아티스트가 수행할 구체적인 업무)
        4.  결과물의 제출, 검수 및 수정 (제출 방법, 검수 기간, 수정 횟수 및 범위)
        5.  계약 기간
        6.  계약 금액 및 지급 방법 (위의 '플랫폼 정산 시스템' 정보를 반드시 반영할 것)
        7.  저작권의 귀속 및 이용 허락 (저작재산권의 양도/공동소유/라이선스 및 저작인격권 관련 내용)
        8.  권리 보증 ('을'의 결과물이 제3자의 권리를 침해하지 않음을 보증)
        9.  비밀유지 의무
        10. 계약의 해제 및 해지
        11. 손해배상
        12. 분쟁 해결 (관할 법원 명시)
        13. 기타 사항 (권리 양도 금지 등)
        14. 면책 조항 (System Prompt에서 지시한 내용)

        **응답 형식 (매우 중요! JSON과 Markdown 본문을 구분자로 분리하세요):**
        {
          "title": "%s",
          "totalAmount": %d,
          "startAt": "%s",
          "endAt": "%s"
        }
        ---CONTRACT_BODY---
        (JSON 블록이 끝난 직후, '---CONTRACT_BODY---' 구분자 뒤에 계약서 본문 전체를 Markdown 형식으로 작성합니다.)
        ## 제 1조 (목적)
        ...
        """,
                request.getTitle(),
                project.getTitle(),
                project.getSummary(),
                positionName,
                request.getTotalAmount(),
                startDate,
                endDate,
                request.getAdditionalDetails() != null ? request.getAdditionalDetails() : "없음",

                request.getTitle(),
                request.getTotalAmount(),
                jsonStartAt,
                jsonEndAt
        );
    }
}