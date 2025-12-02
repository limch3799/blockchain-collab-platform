package com.s401.moas.project.service;

import com.s401.moas.global.service.EmbeddingService;
import com.s401.moas.global.util.EmbeddingTextBuilder;
import com.s401.moas.project.domain.Project;
import com.s401.moas.project.repository.PositionRepository;
import com.s401.moas.project.repository.ProjectPositionRepository;
import com.s401.moas.project.repository.ProjectRepository;
import com.s401.moas.region.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectReindexService {

    private final EmbeddingService embeddingService;
    private final SimilarProjectService similarProjectService;
    private final ProjectRepository projectRepository;
    private final ProjectPositionRepository projectPositionRepository;
    private final PositionRepository positionRepository;
    private final DistrictRepository districtRepository;

    /**
     * 전체 프로젝트를 순회하며 임베딩을 다시 생성하고 유사 프로젝트 검색 인덱스를 업데이트합니다.
     */
    public void reindexAllProjects() {
        log.info("관리자 요청에 의한 전량 프로젝트 재임베딩 시작");
        int page = 0;
        int size = 200;
        int totalProcessed = 0;

        while (true) {
            // 트랜잭션 범위 밖에서 페이징 조회 수행 (read-only)
            var batch = findPage(page++, size);
            if (batch.isEmpty()) {
                break;
            }

            for (var p : batch) {
                try {
                    // 1. 임베딩 텍스트 생성
                    String text = EmbeddingTextBuilder.build(p.title(), p.summary(), p.positions(), p.location());

                    // 2. 임베딩 벡터 생성
                    float[] vec = embeddingService.embed(text);

                    // 3. 유사 프로젝트 인덱스 업데이트 (upsert)
                    var payload = new java.util.HashMap<String, Object>();
                    payload.put("projectId", p.id());
                    payload.put("title", p.title() != null ? p.title() : "");
                    payload.put("city", p.location() != null ? p.location() : "online");
                    similarProjectService.upsert(p.id(), vec, payload);

                    totalProcessed++;
                    if (totalProcessed % 100 == 0) {
                        log.info("재임베딩 진행 중: {}개 처리 완료", totalProcessed);
                    }
                } catch (Exception e) {
                    log.error("프로젝트 재임베딩 실패 - projectId: {}", p.id(), e);
                }
            }
        }

        log.info("전량 프로젝트 재임베딩 완료: 총 {}개 처리", totalProcessed);
    }

    // 기존 러너 클래스에서 findPage 로직을 그대로 가져와 사용합니다.
    @Transactional(readOnly = true)
    private List<ProjectView> findPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        var projects = projectRepository.findAll(pageable).getContent().stream()
                .filter(project -> project.getDeletedAt() == null)
                .toList();

        return projects.stream().map(project -> {
            // 포지션 이름 리스트 조회
            var projectPositions = projectPositionRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
            List<String> positionNames = projectPositions.stream()
                    .map(pp -> {
                        var positionOpt = positionRepository.findById(pp.getPositionId());
                        // DB에서 가져온 포지션 도메인 이름을 사용합니다.
                        return positionOpt.map(com.s401.moas.project.domain.Position::getPositionName).orElse("");
                    })
                    .filter(name -> !name.isEmpty())
                    .toList();

            // 위치 조회
            String location = "online";
            if (project.getDistrictId() != null) {
                var districtOpt = districtRepository.findById(project.getDistrictId());
                // DB에서 가져온 지역 도메인 이름을 사용합니다.
                location = districtOpt.map(com.s401.moas.region.domain.District::getNameKo).orElse("online");
            }

            return new ProjectView(
                    project.getId().longValue(),
                    project.getTitle(),
                    project.getSummary(),
                    positionNames,
                    location
            );
        }).toList();
    }

    public record ProjectView(long id, String title, String summary, List<String> positions, String location) {}
}