package com.s401.moas.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;

@Configuration
public class QdrantConfig {

    @Value("${qdrant.host}")
    private String host; // ex) k13s401.p.ssafy.io
    @Value("${qdrant.port}")
    private int port; // ex) 6334 (gRPC)
    @Value("${qdrant.api-key:}")
    private String apiKey; // 키 없을 수도 있어서 Optional 권장

    @Bean
    public QdrantClient qdrantClient() {
        QdrantGrpcClient.Builder builder = QdrantGrpcClient.newBuilder(host, port, /* useTls */ false);
        if (apiKey != null && !apiKey.isBlank()) {
            builder.withApiKey(apiKey);
        }
        return new QdrantClient(builder.build());
    }
}