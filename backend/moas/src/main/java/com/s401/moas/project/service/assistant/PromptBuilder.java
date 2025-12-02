package com.s401.moas.project.service.assistant;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.s401.moas.project.controller.request.GenerateDescriptionRequest;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.domain.Position;
import com.s401.moas.region.repository.DistrictRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 프롬프트 빌더 (예술 프로젝트 전용 톤/섹션)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PromptBuilder {

    private final PositionRepository positionRepository;
    private final DistrictRepository districtRepository;

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            당신은 공연·전시·창작 등 예술 프로젝트 공고문을 전문적으로 작성하는
            시니어 큐레이터이자 편집장입니다. 산출물은 안내서가 아니라 실제 모집
            공고 페이지에 곧바로 게시될 문서입니다.
            
            **최우선 수칙**
            1. 결과물 전체를 Markdown으로 작성합니다.
            2. 모든 1차 섹션은 반드시 `##` 헤더로 시작하며, 필요 시 하위 항목은 `###`를 사용합니다.
            3. 목록 정보는 무조건 불릿(`-`) 또는 번호 목록을 사용합니다. 문단 나열 금지.
            4. 중요 용어나 상태값, 제출 형식 등은 `백틱` 혹은 **굵게**로 강조합니다.
            5. 표나 비교가 필요하면 Markdown 표를 사용할 수 있습니다.
            6. 누락 정보는 임의 추정 대신 `"협의 가능"`이라고 표기합니다.
            7. 길이는 10,000자 이내, 이모지/광고성 수사/명령형 표현은 금지합니다.
            """;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy.MM.dd").withZone(ZoneId.of("Asia/Seoul"));

    /**
     * 시스템 프롬프트 생성
     */
    public String buildSystemPrompt() {
        return SYSTEM_PROMPT_TEMPLATE;
    }

    /**
     * 사용자 프롬프트 생성 (예술 도메인 친화)
     */
    public String buildUserPrompt(GenerateDescriptionRequest request) {
        StringBuilder prompt = new StringBuilder();

        // 기본 정보
        prompt.append("[제목] ").append(request.getTitle()).append("\n");
        prompt.append("[요약] ").append(request.getSummary()).append("\n");

        // 기간 정보
        if (request.getStartAt() != null && request.getEndAt() != null) {
            LocalDate start = request.getStartAt().toLocalDate();
            LocalDate end = request.getEndAt().toLocalDate();

            if (!start.isAfter(end)) {
                String startStr = start.format(DATE_FORMATTER);
                String endStr = end.format(DATE_FORMATTER);
                prompt.append("[기간] ").append(startStr).append(" ~ ").append(endStr).append("\n");

                // 예술 프로젝트 친화 마일스톤
                String timeline = calculateTimeline(start, end);
                if (timeline != null) {
                    prompt.append("[일정/리허설 마일스톤] ").append(timeline).append("\n");
                }
            } else {
                prompt.append("[기간] 일정 협의 가능\n");
            }
        } else {
            prompt.append("[기간] 일정 협의 가능\n");
        }

        // 장소/협업 방식 안내 (예술 맥락)
        if (request.getDistrictCode() != null && !request.getDistrictCode().isBlank()) {
            // DB에서 지역명 조회
            String districtName = districtRepository.findByCode(request.getDistrictCode())
                    .map(d -> d.getNameKo())
                    .orElse(request.getDistrictCode());
            prompt.append("[장소] 오프라인, 지역: ").append(districtName).append("\n");
            prompt.append("[협업 방식 안내] 오프라인 프로젝트로 현장 중심 운영입니다. 리허설/작업실 대면 진행, 주 1~2회 대면 조율을 기본으로 하며, 안전·보안 및 장비 반입 안내는 별도 공지합니다.\n");
        } else {
            prompt.append("[장소] 온라인\n");
            prompt.append("[협업 방식 안내] 온라인 프로젝트로 원격 리뷰와 합/편집 피드백을 정기적으로 진행합니다. 클라우드 드라이브와 메신저/화상회의를 활용하며, 파일 규격과 제출 일정은 사전 합의합니다.\n");
        }

        // 톤/길이(고정)
        prompt.append("[톤] formal\n");
        prompt.append("[길이] medium\n");

        // 확장 정보
        boolean hasExtendedInfo = false;
        if (request.getPositions() != null && !request.getPositions().isEmpty()) {
            hasExtendedInfo = true;
            String positionsText = request.getPositions().stream()
                    .map(p -> {
                        String positionName = positionRepository.findById(p.getPositionId())
                                .map(Position::getPositionName)
                                .orElse("포지션ID:" + p.getPositionId());
                        if (p.getBudget() != null && p.getBudget() > 0) {
                            return String.format("%s(%d만원)", positionName, p.getBudget() / 10000);
                        } else {
                            return positionName + "(협의 가능)";
                        }
                    })
                    .collect(Collectors.joining(", "));
            prompt.append("[역할/예산] ").append(positionsText).append("\n");
        }

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            hasExtendedInfo = true;
            prompt.append("[장르/분야] ").append(request.getCategory()).append("\n");
        }

        if (request.getApplyDeadline() != null) {
            String deadlineStr = request.getApplyDeadline().toLocalDate().format(DATE_FORMATTER);
            prompt.append("[지원 마감일] ").append(deadlineStr).append("\n");
        }

        // 섹션 구조 요청(예술 프로젝트 버전)
        prompt.append("\n위 정보를 바탕으로, 아래 필수 섹션을 EXACT한 순서로 Markdown 헤더를 넣어 작성하세요.\n");
        prompt.append("각 섹션은 `## 1. ...` 형식을 사용하고, 세부 항목은 불릿 목록으로 정리합니다.\n\n");

        prompt.append("1) 개요\n");
        prompt.append("2) 기획 의도 및 작품 방향\n");
        prompt.append("3) 일정/리허설 및 중간 점검\n");
        prompt.append("4) 협업 방식 및 커뮤니케이션\n");
        prompt.append("5) 지원 방법(포트폴리오 제출·링크, 인터뷰/오디션 등)\n");
        prompt.append("6) 유의사항(저작권·초상권·음원/영상/이미지 사용권, 크레딧 표기, 안전·보안, 정산·세금 안내)\n");

        if (hasExtendedInfo) {
            prompt.append("\n추가로 다음 섹션도 작성하세요:\n");
            prompt.append("7) 역할 및 참여 범위\n");
            prompt.append("8) 제출물/작품 형태 및 규격\n");
            prompt.append("9) 지원 자격\n");
            prompt.append("10) 우대 사항\n");
        }

        if (request.getApplyDeadline() != null) {
            prompt.append("\n지원 마감일이 있으므로, 접수 일정과 검토·연락 프로세스를 포함하세요.\n");
        }

        prompt.append("""

        [응답 형식 샘플]
        ## 1. 개요
        - 프로젝트 요약
        - 주요 성과 지표 또는 기대 효과

        ## 2. 기획 의도 및 작품 방향
        - 콘셉트 키워드
        - 참고 레퍼런스
        - 차별화 포인트

        ## 3. 일정/리허설 및 중간 점검
        - 준비/리허설/본 행사 일정
        - 점검 방식 및 제출 기한
        - `협의 가능`: 날짜 미정인 경우 표기

        위 형식을 그대로 따르되 실제 내용은 요청 정보와 일치하도록 작성하세요.
        """);

        prompt.append("\n각 섹션 말미에는 다음 단계나 제출 서류 등 행동 지침을 한 줄로 정리하세요.\n");
        prompt.append("숫자나 예산 등 확정되지 않은 정보는 '협의 가능'으로 표현하세요.\n");

        return prompt.toString();
    }

    /**
     * 일정/리허설 마일스톤 계산
     * - 3일 미만: 2단계(오리엔테이션/최종 리허설·실행)
     * - 3일 이상: 3단계(오리엔테이션/중간 리허설·점검/본 행사 또는 전시 오픈)
     */
    private String calculateTimeline(LocalDate start, LocalDate end) {
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end);

        if (daysBetween < 3) {
            String ori = start.format(DATE_FORMATTER);
            String finalRun = end.format(DATE_FORMATTER);
            return String.format("오리엔테이션: %s, 최종 리허설 및 실행: %s", ori, finalRun);
        } else {
            long halfDays = (long) Math.floor(daysBetween * 0.5);
            LocalDate midReview = start.plusDays(halfDays);

            String ori = start.format(DATE_FORMATTER);
            String mid = midReview.format(DATE_FORMATTER);
            String open = end.format(DATE_FORMATTER);
            return String.format("오리엔테이션: %s, 중간 리허설·점검: %s, 본 행사/전시 오픈: %s", ori, mid, open);
        }
    }
}
