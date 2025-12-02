package com.s401.moas.admin.controller;

import com.s401.moas.project.service.ProjectReindexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

/**
 * 프로젝트 재임베딩을 수동으로 트리거하는 관리자 컨트롤러입니다.
 * 이 엔드포인트는 장시간이 소요되는 작업을 비동기적으로 실행합니다.
 * 실제 운영 환경에서는 이 엔드포인트에 대한 적절한 인증 및 권한 부여(예: JWT 기반의 관리자 Role 체크)가 반드시 필요합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/reindex")
@RequiredArgsConstructor
public class ReindexController {

    // 재임베딩 핵심 로직을 담고 있는 서비스 주입
    private final ProjectReindexService projectReindexService;

    /**
     * 전체 프로젝트에 대한 재임베딩 프로세스를 비동기적으로 시작합니다.
     * HTTP 요청 스레드가 재임베딩 작업이 완료될 때까지 기다리지 않도록 CompletableFuture를 사용합니다.
     *
     * @return 202 Accepted 응답과 함께 작업 시작 메시지를 반환합니다.
     */
    @PostMapping("/projects")
    public ResponseEntity<String> reindexProjects() {
        log.info("관리자 요청에 의해 전체 프로젝트 재임베딩 작업이 시작됩니다. (비동기)");

        // CompletableFuture를 사용하여 작업을 별도의 스레드에서 비동기적으로 실행합니다.
        // 이를 통해 HTTP 요청은 즉시 응답할 수 있으며, 장시간 작업으로 인한 타임아웃을 방지합니다.
        CompletableFuture.runAsync(() -> {
            try {
                projectReindexService.reindexAllProjects();
            } catch (Exception e) {
                log.error("비동기 프로젝트 재임베딩 중 치명적인 오류 발생", e);
            }
        });

        // 클라이언트에게 작업이 성공적으로 수락되었음을 알리는 202 Accepted 상태 코드를 반환합니다.
        return ResponseEntity.accepted().body("Project re-indexing started asynchronously. Check logs for status updates.");
    }
}