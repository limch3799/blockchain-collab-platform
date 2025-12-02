package com.s401.moas.contract.service;

import com.s401.moas.contract.controller.request.GenerateContractRequest;
import com.s401.moas.contract.controller.response.GenerateContractResponse;
import com.s401.moas.contract.service.assistant.ContractContentGuard;
import com.s401.moas.contract.service.assistant.ContractPromptBuilder;
import com.s401.moas.contract.service.assistant.ContractResponseParser;
import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.member.domain.MemberRole;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.domain.ProjectPosition;
import com.s401.moas.project.exception.ProjectException;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import com.s401.moas.global.service.LlmClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractAssistantService {

    private final LlmClient llmClient;
    private final ContractPromptBuilder promptBuilder;
    private final ContractResponseParser responseParser;
    private final ContractContentGuard contentGuard;
    private final ProjectRepository projectRepository;
    private final ProjectPositionRepository projectPositionRepository;
    private final PositionRepository positionRepository;

    /**
     * 계약서 초안 생성
     *
     * @param request 계약서 생성 요청
     * @return 생성된 계약서 초안
     */
    @Transactional(readOnly = true)
    public GenerateContractResponse generateContract(GenerateContractRequest request) {
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
        log.info("계약서 초안 생성 요청 - memberId: {}, 제목: {}",
                memberId, request.getTitle());

        ProjectPosition projectPosition = projectPositionRepository.findById(request.getProjectPositionId())
                .orElseThrow(() -> ProjectException.projectPositionNotFound(null));
        Project project = projectRepository.findById(projectPosition.getProjectId())
                .orElseThrow(() -> ProjectException.projectNotFound(projectPosition.getProjectId()));

        // 3. 프롬프트 빌드
        String systemPrompt = promptBuilder.buildSystemPrompt();
        String userPrompt = promptBuilder.buildUserPrompt(request, project, projectPosition); // DB 정보 전달

        // 4. LLM 호출
        String rawResponse = llmClient.generate(systemPrompt, userPrompt);

        // 5. 응답 파싱 (JSON 문자열 -> DTO 객체)
        GenerateContractResponse response = responseParser.parseResponse(rawResponse);

        // 6. 콘텐츠 가드레일 적용
        response = contentGuard.applyGuards(response, request);

        return response;
    }
}