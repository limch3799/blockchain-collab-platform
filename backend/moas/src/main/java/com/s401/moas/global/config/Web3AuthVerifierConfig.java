package com.s401.moas.global.config;

import com.s401.moas.auth.Web3AuthIdTokenVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Web3AuthVerifierConfig {
    @Bean
    public Web3AuthIdTokenVerifier web3AuthIdTokenVerifier(
            @Value("${web3auth.issuer}") String issuer,
            @Value("${web3auth.audience}") String audience
    ) throws Exception {
        return new Web3AuthIdTokenVerifier(issuer, audience);
    }
}
