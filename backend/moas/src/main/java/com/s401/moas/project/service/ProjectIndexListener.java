package com.s401.moas.project.service;

import com.s401.moas.global.service.EmbeddingService;
import com.s401.moas.global.util.EmbeddingTextBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProjectIndexListener {

    private final EmbeddingService embeddingService;
    private final SimilarProjectService similarProjectService;
    private final com.s401.moas.project.repository.ProjectRepository projectRepository;
    private final com.s401.moas.project.repository.ProjectPositionRepository projectPositionRepository;
    private final com.s401.moas.project.repository.PositionRepository positionRepository;
    private final com.s401.moas.region.repository.DistrictRepository districtRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onChanged(ProjectChangedEvent ev) {
        try {
            var p = get(ev.projectId());
            if (p == null) {
                log.warn("프로젝트를 찾을 수 없습니다 - projectId: {}", ev.projectId());
                return;
            }

            String text = EmbeddingTextBuilder.build(p.title(), p.summary(), p.positions(), p.location());
            float[] vec = embeddingService.embed(text);

            Map<String, Object> payload = Map.of(
                    "projectId", ev.projectId(),
                    "title", p.title() != null ? p.title() : "",
                    "city", p.location() != null ? p.location() : "online"
            );

            similarProjectService.upsert(ev.projectId(), vec, payload);
            log.debug("프로젝트 인덱싱 완료 - projectId: {}", ev.projectId());
        } catch (Exception e) {
            log.error("프로젝트 인덱싱 실패 - projectId: {}", ev.projectId(), e);
        }
    }

    private ProjectLight get(long id) {
        var projectOpt = projectRepository.findById((int) id);
        if (projectOpt.isEmpty()) {
            return null;
        }
        var project = projectOpt.get();

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

        return new ProjectLight(
                project.getTitle(),
                project.getSummary(),
                positionNames,
                location
        );
    }

    public interface ProjectLightReader {
        ProjectLight get(long id);
    }

    public record ProjectLight(String title, String summary, List<String> positions, String location) {}
}

