package com.s401.moas.contract.blockchain;

import com.s401.moas.blockchain.service.BlockchainClient;
import com.s401.moas.blockchain.service.dto.CreateContractOnChainCommand;
import com.s401.moas.blockchain.service.dto.OnChainContractDto;
import com.s401.moas.blockchain.wrapper.MOASContract;
import com.s401.moas.blockchain.wrapper.MOASForwarder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlockchainClientTest {

    @InjectMocks
    private BlockchainClient blockchainClient;

    @Mock
    private MOASForwarder moasForwarder;
    @Mock
    private MOASContract moasContract;
    @Mock
    private Credentials credentials;

    // 테스트에 필요한 @Value 필드 미리 주입합니다.
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(blockchainClient, "moasContractAddress", "0x0000000000000000000000000000000000000002");
    }

    @Test
    @DisplayName("계약 생성 요청 시 새로운 파라미터로 Forwarder를 통해 트랜잭션을 성공적으로 전송한다")
    void createContractOnChain_Success_WithNewParams() throws Exception {
        // given: 새로운 스마트 컨트랙트의 파라미터에 맞는 Command 객체를 생성합니다.
        BigInteger dbContractId = BigInteger.valueOf(123L);
        CreateContractOnChainCommand command = new CreateContractOnChainCommand(
                dbContractId,
                "New Contract Title",
                "0xLEADER_ADDRESS",
                "0xARTIST_ADDRESS",
                BigInteger.valueOf(10000),
                "2024-01-01T00:00:00Z",
                "2024-12-31T23:59:59Z",
                "https://new-metadata.uri/123",
                new byte[0],
                new byte[0]
        );

        TransactionReceipt fakeReceipt = new TransactionReceipt();
        fakeReceipt.setStatus("0x1");
        fakeReceipt.setTransactionHash("0xNEW_TX_HASH");

        // 이벤트에서 반환될 tokenId는 우리가 command에 넣은 DB ID와 동일해야 합니다.
        MOASContract.ContractCreatedEventResponse fakeEvent = new MOASContract.ContractCreatedEventResponse();
        fakeEvent.tokenId = dbContractId;

        when(credentials.getAddress()).thenReturn("0x0000000000000000000000000000000000000001");

        // createContract 메소드의 파라미터 개수(9개)에 맞게 Mocking을 수정합니다.
        when(moasContract.createContract(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(mock(RemoteFunctionCall.class));
        when(moasContract.createContract(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()).encodeFunctionCall())
                .thenReturn("0xNEW_ENCODED_FUNCTION");

        RemoteFunctionCall<TransactionReceipt> remoteCall = mock(RemoteFunctionCall.class);
        when(moasForwarder.execute(any(MOASForwarder.ForwardRequestData.class), any(BigInteger.class))).thenReturn(remoteCall);
        when(remoteCall.send()).thenReturn(fakeReceipt);

        try (var mockedStatic = mockStatic(MOASContract.class)) {
            mockedStatic.when(() -> MOASContract.getContractCreatedEvents(any())).thenReturn(Collections.singletonList(fakeEvent));

            // when
            OnChainContractDto result = blockchainClient.createContractOnChain(command);

            // then
            assertThat(result.transactionHash()).isEqualTo("0xNEW_TX_HASH");
            // 결과로 나온 tokenId가 우리가 입력한 DB ID와 같은지 확인합니다.
            assertThat(result.tokenId()).isEqualTo(dbContractId);
            verify(moasForwarder, times(1)).execute(any(MOASForwarder.ForwardRequestData.class), eq(BigInteger.ZERO));
        }
    }

    @Test
    @DisplayName("계약 상태 변경 요청 시 Forwarder를 통해 트랜잭션을 성공적으로 전송한다")
    void updateContractStatusOnChain_Success() throws Exception {
        // given
        BigInteger tokenId = BigInteger.TEN;
        TransactionReceipt fakeReceipt = new TransactionReceipt();
        fakeReceipt.setStatus("0x1");
        fakeReceipt.setTransactionHash("0xUPDATE_TX_HASH");

        // 테스트에 필요한 Mock 행동만 여기에 정의합니다.
        when(credentials.getAddress()).thenReturn("0x0000000000000000000000000000000000000001");
        when(moasContract.updateContractStatus(any(), any())).thenReturn(mock(RemoteFunctionCall.class));
        when(moasContract.updateContractStatus(any(), any()).encodeFunctionCall()).thenReturn("0xUPDATE_ENCODED");
        RemoteFunctionCall<TransactionReceipt> remoteCall = mock(RemoteFunctionCall.class);
        when(moasForwarder.execute(any(MOASForwarder.ForwardRequestData.class), any(BigInteger.class))).thenReturn(remoteCall);
        when(remoteCall.send()).thenReturn(fakeReceipt);

        // when
        TransactionReceipt result = blockchainClient.updateContractStatusOnChain(tokenId);

        // then
        assertThat(result.getTransactionHash()).isEqualTo("0xUPDATE_TX_HASH");
        verify(moasContract, times(1)).updateContractStatus(eq(tokenId), eq(BigInteger.ONE));
        verify(moasForwarder, times(1)).execute(any(MOASForwarder.ForwardRequestData.class), eq(BigInteger.ZERO));
    }

    @Test
    @DisplayName("계약 취소 요청 시 Forwarder를 통해 트랜잭션을 성공적으로 전송한다")
    void cancelContractOnChain_Success() throws Exception {
        // given
        BigInteger tokenId = BigInteger.valueOf(20L);
        TransactionReceipt fakeReceipt = new TransactionReceipt();
        fakeReceipt.setStatus("0x1");
        fakeReceipt.setTransactionHash("0xCANCEL_TX_HASH");

        // 이 테스트에 필요한 Mock 행동만 여기에 정의합니다.
        when(credentials.getAddress()).thenReturn("0x0000000000000000000000000000000000000001");
        when(moasContract.cancelContract(any())).thenReturn(mock(RemoteFunctionCall.class));
        when(moasContract.cancelContract(any()).encodeFunctionCall()).thenReturn("0xCANCEL_ENCODED");
        RemoteFunctionCall<TransactionReceipt> remoteCall = mock(RemoteFunctionCall.class);
        when(moasForwarder.execute(any(MOASForwarder.ForwardRequestData.class), any(BigInteger.class))).thenReturn(remoteCall);
        when(remoteCall.send()).thenReturn(fakeReceipt);

        // when
        TransactionReceipt result = blockchainClient.cancelContractOnChain(tokenId);

        // then
        assertThat(result.getTransactionHash()).isEqualTo("0xCANCEL_TX_HASH");
        verify(moasContract, times(1)).cancelContract(eq(tokenId));
        verify(moasForwarder, times(1)).execute(any(MOASForwarder.ForwardRequestData.class), eq(BigInteger.ZERO));
    }

    @Test
    @DisplayName("계약 상태 조회 요청 시 MOASContract의 view 함수를 직접 호출한다")
    void getContractStatus_Success() throws Exception {
        // given
        BigInteger tokenId = BigInteger.valueOf(30L);
        BigInteger expectedStatus = BigInteger.ZERO;

        // 이 테스트에서는 credentials를 사용하지 않으므로 Mock 행동을 정의하지 않습니다.
        RemoteFunctionCall<BigInteger> remoteCall = mock(RemoteFunctionCall.class);
        when(moasContract.contractStatus(any())).thenReturn(remoteCall);
        when(remoteCall.send()).thenReturn(expectedStatus);

        // when
        BigInteger actualStatus = blockchainClient.getContractStatus(tokenId);

        // then
        assertThat(actualStatus).isEqualTo(expectedStatus);
        verify(moasContract, times(1)).contractStatus(eq(tokenId));
        verify(moasForwarder, never()).execute(any(), any());
    }
}