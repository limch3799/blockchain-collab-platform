package com.s401.moas.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.s401.moas.auth.exception.AuthException;
import lombok.extern.slf4j.Slf4j;

import com.nimbusds.jose.util.DefaultResourceRetriever;
import com.nimbusds.jose.util.ResourceRetriever;
import java.net.URI;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
public class Web3AuthIdTokenVerifier {
    // 권장값(문서 기준)
    // iss: https://api-auth.web3auth.io
    // aud: Web3Auth(Embedded Wallets) 프로젝트의 Client ID
    private final String expectedIssuer;
    private final String expectedAud;
    private final ConfigurableJWTProcessor<SecurityContext> processor;

    public Web3AuthIdTokenVerifier(String issuer, String audience) throws Exception {
        this.expectedIssuer = issuer;
        this.expectedAud = audience;

        // ✅ 문서 권장 JWKS 엔드포인트: https://api-auth.web3auth.io/jwks
        String jwksEndpoint = issuer.endsWith("/") ? issuer + "jwks" : issuer + "/jwks";
        URI jwksUri = URI.create(jwksEndpoint);
        // 타임아웃 및 최대 응답 크기 지정(실서비스 안전값)
        ResourceRetriever retriever = new DefaultResourceRetriever(2000, 2000, 512_000);
        JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<SecurityContext>(jwksUri.toURL(), retriever);

        // ES256 서명 검증용 키 셀렉터
        JWSVerificationKeySelector<SecurityContext> selector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.ES256, jwkSource);

        DefaultJWTProcessor<SecurityContext> p = new DefaultJWTProcessor<>();
        p.setJWSKeySelector(selector);
        this.processor = p;
    }

    /**
     * @return 검증된 JWT의 Claims(검증 실패 시 AuthException)
     * <p>
     * 토큰에 기대되는 대표 클레임들(문서 샘플 기준):
     * - iat, exp, iss(= https://api-auth.web3auth.io), aud(=프로젝트 Client ID), nonce
     * - wallets: [{ public_key, type("web3auth_app_key"), curve("ed25519"/"secp256k1") }, ...]
     * - email, name, profileImage (대시보드 설정에 따라 미포함 가능)
     * - authConnection ("web3auth"), userId, groupedAuthConnectionId 등
     * <p>
     * 참고: 이메일/이름 등 PII는 설정에 따라 나오지 않을 수 있음.
     */
    public JWTClaimsSet verify(String idToken) {
        try {
            // JWS 서명 검증 + 파싱
            SignedJWT signedJWT;
            try {
                signedJWT = SignedJWT.parse(idToken);
            } catch (ParseException | IllegalArgumentException e) {
                throw AuthException.invalidIdToken(e);
            }

            // 서명 검증 및 클레임 파싱
            JWTClaimsSet claims;
            try {
                claims = processor.process(signedJWT, null);
            } catch (Exception e) {
                // 서명 검증 실패, 파싱 실패 등
                throw AuthException.invalidIdToken(e);
            }

            // 표준 검증
            if (!expectedIssuer.equals(claims.getIssuer())) {
                throw AuthException.invalidIdToken();
            }
            if (claims.getExpirationTime() == null || new Date().after(claims.getExpirationTime())) {
                throw AuthException.invalidIdToken();
            }
            if (!claims.getAudience().contains(expectedAud)) {
                throw AuthException.invalidIdToken();
            }

            // 필수 클레임 검증
            String userId = claims.getStringClaim("userId");
            if (userId == null || userId.isBlank()) {
                throw AuthException.invalidIdToken();
            }

            // (선택) nonce 검증: 클라이언트가 전달한 nonce와 대조하려면 여기서 수행
            // String nonce = claims.getStringClaim("nonce");

            // ── 디버깅/가시화용 로그 ───────────────────────────────
            log.debug("[Web3Auth] iss={}, aud={}, iat={}, exp={}",
                    claims.getIssuer(), claims.getAudience(),
                    claims.getIssueTime(), claims.getExpirationTime());

            // 지갑 키 정보 (앱 키/threshold 키 등)
            Object walletsObj = claims.getClaim("wallets");
            if (walletsObj instanceof List<?> wallets) {
                for (Object w : wallets) {
                    if (w instanceof Map<?, ?> m) {
                        Object pub = m.get("public_key");
                        Object type = m.get("type");
                        Object curve = m.get("curve");
                        log.debug("[Web3Auth] wallet: public_key={}, type={}, curve={}", pub, type, curve);
                    }
                }
            } else {
                log.debug("[Web3Auth] wallets claim not present or not an array");
            }

            String grouped = claims.getStringClaim("groupedAuthConnectionId"); // 프로바이더 유추용
            String provider = resolveProvider(grouped); // 아래 함수 참고
            log.debug("[Web3Auth] auth: userId={}, provider={}", userId, provider);
            // ────────────────────────────────────────────────────

            return claims;
        } catch (AuthException e) {
            // AuthException은 그대로 다시 throw
            throw e;
        } catch (Exception e) {
            // 예상치 못한 모든 예외는 invalidIdToken으로 래핑
            throw AuthException.invalidIdToken(e);
        }
    }

    private String resolveProvider(String grouped) {
        if (grouped == null) return "unknown";
        String g = grouped.toLowerCase();
        if (g.contains("google")) return "google";
        if (g.contains("kakao")) return "kakao";      // "web3auth-auth0-kakao-..." 패턴
        if (g.contains("apple")) return "apple";
        return "unknown";
    }
}