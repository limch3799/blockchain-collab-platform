package com.s401.moas.blockchain.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "eip712")
@Getter
@Setter
public class Eip712Properties {
    private Domain domain;
    private Long chainId;
    private String verifyingContract;

    @Getter
    @Setter
    public static class Domain {
        private String name;
        private String version;
    }
}