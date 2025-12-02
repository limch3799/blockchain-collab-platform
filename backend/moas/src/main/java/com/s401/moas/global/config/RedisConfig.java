package com.s401.moas.global.config;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import io.lettuce.core.resource.ClientResources;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis 설정 클래스
 * 키/값을 문자열로 직렬화하여 단순하고 디버깅이 쉬움
 * 필요 시 Jackson으로 값 직렬화 변경 가능
 */
@Configuration
@EnableConfigurationProperties
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(
            @Value("${spring.data.redis.host}") String host,
            @Value("${spring.data.redis.port}") int port,
            @Value("${spring.data.redis.password:}") String password) {
        
        RedisStandaloneConfiguration standalone = new RedisStandaloneConfiguration(host, port);
        if (password != null && !password.isBlank()) {
            standalone.setPassword(password);
        }

        // 커넥션/읽기 타임아웃 등
        ClientOptions clientOptions = ClientOptions.builder()
                .autoReconnect(true)
                .build();

        SocketOptions socketOptions = SocketOptions.builder()
                .connectTimeout(java.time.Duration.ofSeconds(3))
                .build();

        ClientResources resources = ClientResources.create();

        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .clientOptions(clientOptions)
                .clientResources(resources)
                .commandTimeout(java.time.Duration.ofSeconds(3))
                .build();

        return new LettuceConnectionFactory(standalone, clientConfig);
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(LettuceConnectionFactory lcf) {
        StringRedisTemplate t = new StringRedisTemplate();
        t.setConnectionFactory(lcf);
        // 기본 StringSerializer라 별도 설정 불필요
        return t;
    }
}

