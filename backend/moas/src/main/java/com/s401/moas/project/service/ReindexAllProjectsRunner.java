package com.s401.moas.project.service;

import com.s401.moas.global.service.EmbeddingService;
import com.s401.moas.global.util.EmbeddingTextBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Profile("reindex")
@RequiredArgsConstructor
public class ReindexAllProjectsRunner implements CommandLineRunner {

    private final EmbeddingService embeddingService;
    private final SimilarProjectService similarProjectService;
    private final com.s401.moas.project.repository.ProjectRepository projectRepository;
    private final com.s401.moas.project.repository.ProjectPositionRepository projectPositionRepository;
    private final com.s401.moas.project.repository.PositionRepository positionRepository;
    private final com.s401.moas.region.repository.DistrictRepository districtRepository;

    @Override
    public void run(String... args) {
        log.info("전량 프로젝트 재임베딩 시작");
        int page = 0;
        int size = 200;
        int totalProcessed = 0;

        while (true) {
            var batch = findPage(page++, size);
            if (batch.isEmpty()) {
                break;
            }

            for (var p : batch) {
                try {
                    String text = EmbeddingTextBuilder.build(p.title(), p.summary(), p.positions(), p.location());
                    float[] vec = embeddingService.embed(text);
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
                        return positionOpt.map(com.s401.moas.project.domain.Position::getPositionName).orElse("");
                    })
                    .filter(name -> !name.isEmpty())
                    .toList();

            // 위치 조회
            String location = "online";
            if (project.getDistrictId() != null) {
                var districtOpt = districtRepository.findById(project.getDistrictId());
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

    public interface ProjectReader {
        List<ProjectView> findPage(int page, int size);
    }

    public record ProjectView(long id, String title, String summary, List<String> positions, String location) {}
}

