package com.s401.moas.global.sse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor  // ObjectMapper 주입을 위해
public class SseService {

    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60; // 60분
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;  // 추가!

    public SseEmitter connect(Integer memberId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitters.put(memberId, emitter);

        log.info("SSE 연결 성공: memberId={}", memberId);

        emitter.onCompletion(() -> {
            emitters.remove(memberId);
            log.info("SSE 연결 종료: memberId={}", memberId);
        });

        emitter.onTimeout(() -> {
            emitters.remove(memberId);
            log.info("SSE 타임아웃: memberId={}", memberId);
        });

        emitter.onError((e) -> {
            emitters.remove(memberId);
            log.error("SSE 에러 발생: memberId={}", memberId, e);
        });

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected"));
        } catch (IOException e) {
            log.error("SSE 연결 확인 이벤트 전송 실패: memberId={}", memberId, e);
        }

        return emitter;
    }

    public void send(Integer memberId, String eventType, Object data) {
        SseEmitter emitter = emitters.get(memberId);

        if (emitter != null) {
            try {
                // ObjectMapper로 JSON 변환
                String jsonData = objectMapper.writeValueAsString(data);

                emitter.send(SseEmitter.event()
                        .name(eventType)
                        .data(jsonData));

                log.info("SSE 이벤트 전송 성공: memberId={}, eventType={}, data={}",
                        memberId, eventType, jsonData);
            } catch (IOException e) {
                emitters.remove(memberId);
                log.error("SSE 이벤트 전송 실패: memberId={}, eventType={}", memberId, eventType, e);
            }
        } else {
            log.debug("SSE 미접속 사용자: memberId={}, eventType={}", memberId, eventType);
        }
    }
}