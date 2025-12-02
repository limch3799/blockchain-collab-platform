package com.s401.moas.blockchain.config;

import com.s401.moas.blockchain.wrapper.MOASContract;
import com.s401.moas.blockchain.wrapper.MOASForwarder;
import lombok.extern.slf4j.Slf4j;
import org.java_websocket.client.WebSocketClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.websocket.WebSocketService;
import org.web3j.tx.gas.DefaultGasProvider;

import java.net.ConnectException;
import java.net.URI;

@Slf4j
@Configuration
public class BlockchainConfig {

    @Value("${blockchain.network.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.network.ws-url}")
    private String wsUrl;

    @Value("${blockchain.wallet.private-key}")
    private String privateKey;

    @Value("${blockchain.contract.moas-address}")
    private String moasContractAddress;

    /**
     * [HTTP 기반 Web3j] 일반적인 RPC 요청(트랜잭션 전송, 상태 조회 등)을 위한 기본 Web3j 인스턴스입니다.
     * @Primary 어노테이션을 통해, 별도 지정이 없을 경우 이 Bean이 우선적으로 주입됩니다.
     */
    @Primary
    @Bean("httpWeb3j")
    public Web3j httpWeb3j() {
        log.info("HTTP Web3j Bean을 생성합니다. RPC URL: {}", rpcUrl);
        return Web3j.build(new HttpService(rpcUrl));
    }

    /**
     * [WebSocket 기반 Web3j] 오직 '이벤트 리스닝'만을 위한 Web3j 인스턴스입니다.
     * 안정적인 연결을 유지하여 'filter not found' 오류를 방지합니다.
     */
    @Bean("webSocketWeb3j")
    public Web3j webSocketWeb3j() {
        log.info("WebSocket Web3j Bean을 생성합니다. WS URL: {}", wsUrl);
        try {
            WebSocketService webSocketService = new WebSocketService(wsUrl, true);
            webSocketService.connect();
            return Web3j.build(webSocketService);
        } catch (ConnectException e) {
            log.error("WebSocket 연결에 실패했습니다. URL: {}", wsUrl, e);
            // WebSocket 연결 실패 시 예외를 던져 애플리케이션 시작을 막는 것이 안전할 수 있습니다.
            throw new RuntimeException("WebSocket Web3j Bean 생성에 실패했습니다.", e);
        }
    }

    @Bean
    public Credentials credentials() {
        return Credentials.create(privateKey);
    }

    /**
     * [쓰기용] MOASContract Bean을 등록합니다.
     * 트랜잭션 전송에는 안정적인 HTTP 기반 Web3j와 실제 서버 지갑(Credentials)을 사용합니다.
     */
    @Bean("moasContractWriter")
    public MOASContract moasContractWriter(@Qualifier("httpWeb3j") Web3j web3j, Credentials credentials) {
        DefaultGasProvider gasProvider = new DefaultGasProvider();
        return MOASContract.load(moasContractAddress, web3j, credentials, gasProvider);
    }

    /**
     * [읽기/이벤트용] MOASContract Bean을 등록합니다.
     * OnchainEventListener에서 안정적인 이벤트 구독을 위해 WebSocket 기반 Web3j를 사용합니다.
     * 읽기 전용이므로 더미 Credentials를 사용합니다.
     */
    @Bean("moasContractListener")
    public MOASContract moasContractListener(@Qualifier("webSocketWeb3j") Web3j web3j) {
        Credentials dummyCredentials = Credentials.create("0x0000000000000000000000000000000000000000000000000000000000000001");
        return MOASContract.load(moasContractAddress, web3j, dummyCredentials, new DefaultGasProvider());
    }
}