package com.s401.moas.global.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import reactor.netty.http.client.HttpClient;

@Service
public class EmbeddingService {
    private final WebClient web;
    private final String embedUrl;

    public EmbeddingService(@Value("${embedding.url}") String embedUrl) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10));

        this.web = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
        this.embedUrl = embedUrl;
    }

    public float[] embed(String text) {
        Map<String, Object> body = Map.of(
                "model", "nomic-embed-text",
                "prompt", text
        );

        Map<String, Object> res = web.post()
                .uri(embedUrl)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .block();

        List<Double> arr = (List<Double>) res.get("embedding");
        float[] v = new float[arr.size()];
        for (int i = 0; i < arr.size(); i++) v[i] = arr.get(i).floatValue();
        normalizeL2(v); // 코사인용 안정화
        return v;
    }

    private static void normalizeL2(float[] a){
        double s=0; for(float x:a) s += x*x;
        if (s == 0) return;
        float inv = (float)(1.0 / Math.sqrt(s));
        for (int i=0;i<a.length;i++) a[i] *= inv;
    }
}
