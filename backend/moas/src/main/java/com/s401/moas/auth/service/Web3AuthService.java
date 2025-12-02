package com.s401.moas.auth.service;

import com.nimbusds.jwt.JWTClaimsSet;
import com.s401.moas.auth.Web3AuthIdTokenVerifier;
import com.s401.moas.auth.exception.AuthException;
import com.s401.moas.auth.service.dto.Web3AuthMemberDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Keys;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class Web3AuthService {

    private final Web3AuthIdTokenVerifier verifier;

    public Web3AuthMemberDto parseIdToken(String idToken, String clientWalletAddress) {
        JWTClaimsSet claims = verifier.verify(idToken);

        String providerId = getStringClaim(claims, "userId");
        if (providerId == null || providerId.isBlank()) {
            throw AuthException.invalidIdToken();
        }

        String grouped = getStringClaim(claims, "groupedAuthConnectionId");
        if (grouped == null) {
            Object ac = claims.getClaim("authConnection");
            grouped = ac == null ? null : ac.toString();
        }
        String provider = resolveProvider(grouped);

        //String walletAddress = extractWalletPublicKey(claims);
        if (clientWalletAddress == null || clientWalletAddress.isBlank() || !clientWalletAddress.startsWith("0x")) {
            log.warn("Invalid clientWalletAddress provided: {}", clientWalletAddress);
            throw AuthException.invalidArguments();
        }

        log.info("Web3Auth DTO Build: providerId={}, provider={}, walletAddress={}",
                providerId, provider, clientWalletAddress);

        return Web3AuthMemberDto.builder()
                .providerId(providerId)
                .provider(provider)
                .walletAddress(clientWalletAddress)
                .build();
    }

    private String extractWalletPublicKey(JWTClaimsSet claims) {
        Object walletsObj = claims.getClaim("wallets");
        if (walletsObj instanceof List<?> wallets) {
            for (Object w : wallets) {
                if (w instanceof Map<?, ?> m) {
                    Object typeObj = m.get("type");
                    Object curveObj = m.get("curve");
                    Object pubKeyObj = m.get("public_key");
                    
                    // type = web3auth_threshold_key, curve = secp256k1 조건 확인
                    if (typeObj != null && curveObj != null && pubKeyObj != null) {
                        String type = typeObj.toString();
                        String curve = curveObj.toString();
                        
                        if ("web3auth_threshold_key".equals(type) && "secp256k1".equals(curve)) {
                            return pubKeyObj.toString();
                        }
                    }
                }
            }
        }
        return null;
    }

    private String resolveProvider(String grouped) {
        if (grouped == null) return "unknown";
        String g = grouped.toLowerCase();
        if (g.contains("google")) return "google";
        if (g.contains("kakao")) return "kakao";
        if (g.contains("apple")) return "apple";
        return "unknown";
    }

    private String getStringClaim(JWTClaimsSet claims, String name) {
        Object v = claims.getClaim(name);
        return v == null ? null : v.toString();
    }
}


