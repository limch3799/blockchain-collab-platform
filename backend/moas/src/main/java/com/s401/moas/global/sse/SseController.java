package com.s401.moas.global.sse;

import com.s401.moas.global.security.SecurityUtil;
import com.s401.moas.global.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    /**
     * SSE 연결
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        Integer memberId = SecurityUtil.getCurrentMemberId();
        log.info("SSE 연결 요청: memberId={}", memberId);
        return sseService.connect(memberId);
    }
}