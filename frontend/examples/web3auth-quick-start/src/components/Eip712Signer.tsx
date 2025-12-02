import React, { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import apiClient from '../services/apiClient';
import { TypedDataResponse } from '../types/api';

interface Eip712SignerProps {
  contractId: number | undefined;
  buttonText: string;
  onSignSuccess: (signature: `0x${string}`) => void;
  onSignError: (error: Error) => void;
  disabled?: boolean;
}

const Eip712Signer: React.FC<Eip712SignerProps> = ({
  contractId,
  buttonText,
  onSignSuccess,
  onSignError,
  disabled = false,
}) => {
  // signTypedData 대신 signTypedDataAsync를 사용합니다.
  const { 
    error: signErrorHook, // 훅 자체의 설정 에러 등을 위한 변수
    isLoading,
    signTypedDataAsync,
  } = useSignTypedData();

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSignClick = async () => {
    // 에러 상태 초기화
    setApiError(null);
    console.log("1. [handleSignClick] Button clicked! contractId:", contractId);

    if (typeof contractId !== 'number' || contractId <= 0) {
      const err = new Error('Invalid or missing contractId');
      onSignError(err);
      return;
    }

    // signTypedDataAsync 함수가 준비되지 않았으면 실행하지 않음
    if (!signTypedDataAsync) {
      const err = new Error('Signing function is not ready.');
      onSignError(err);
      return;
    }

    try {
      // 1. 백엔드에서 서명 데이터 가져오기
      console.log("2. [handleSignClick] Fetching signature data...");
      const response = await apiClient.get<TypedDataResponse>(
        `/contracts/${contractId}/signature-data`
      );
      const typedData = response.data;
      console.log("3. [handleSignClick] Signature data received:", typedData);
      
      // 2. 데이터 형식 변환 (기존 로직과 동일)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { EIP712Domain, ...types } = typedData.types;
      const messageForSigner = {
        ...typedData.message,
        tokenId: BigInt(typedData.message.tokenId),
        totalAmount: BigInt(typedData.message.totalAmount),
      };

      // 3. signTypedDataAsync를 직접 await하여 서명 요청
      console.log("4. [handleSignClick] Calling signTypedDataAsync and awaiting result...");
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: types,
        primaryType: typedData.primaryType,
        message: messageForSigner,
      });

      // 4. 서명 성공 시 콜백 호출
      console.log("5. [handleSignClick] Await successful! Signature received:", signature);
      onSignSuccess(signature);

    } catch (err: any) {
      // API 호출 실패 또는 사용자가 서명을 거부한 경우 모두 이 catch 블록으로 들어옴
      const errorMessage = err.shortMessage || err.message || '알 수 없는 오류가 발생했습니다.';
      console.error("ERROR! [handleSignClick] Catch block triggered:", err);
      
      if (err.response) { // Axios API 에러
        const apiErrorMessage = err.response?.data?.message || '서명 데이터를 가져오는 데 실패했습니다.';
        setApiError(apiErrorMessage);
        onSignError(new Error(apiErrorMessage));
      } else { // 지갑 서명 관련 에러 (거부 등)
        onSignError(new Error(errorMessage));
      }
    }
  };

  const finalError = apiError || signErrorHook?.message;

  return (
    <div>
      <button onClick={handleSignClick} disabled={isLoading || disabled} className="card">
        {isLoading ? '지갑 확인 중...' : buttonText}
      </button>
      {finalError && <p style={{ color: 'red', marginTop: '10px' }}>오류: {finalError}</p>}
    </div>
  );
};

export default Eip712Signer;