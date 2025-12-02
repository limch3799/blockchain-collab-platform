/**
 * Eip712Signer Component
 *
 * EIP-712 서명을 처리하는 컴포넌트
 * - 백엔드에서 서명 데이터 가져오기
 * - 지갑 연결 및 서명 요청
 * - 서명 성공/실패 처리
 */

import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import { getSignatureData } from '@/api/contract';

interface Eip712SignerProps {
  contractId: number | undefined;
  buttonText: string;
  onSignStart?: () => void;
  onDataPrepared?: () => void;
  onSigningStarted?: () => void;
  onSignSuccess: (signature: `0x${string}`) => void;
  onSignError: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

export function Eip712Signer({
  contractId,
  buttonText,
  onSignStart,
  onDataPrepared,
  onSigningStarted,
  onSignSuccess,
  onSignError,
  disabled = false,
  className = '',
}: Eip712SignerProps) {
  const {
    error: signErrorHook,
    isPending: isLoading,
    signTypedDataAsync,
  } = useSignTypedData();

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSignClick = async () => {
    setApiError(null);
    console.log('[Eip712Signer] Button clicked! contractId:', contractId);

    // 서명 시작 콜백 호출
    if (onSignStart) {
      onSignStart();
    }

    if (typeof contractId !== 'number' || contractId <= 0) {
      const err = new Error('Invalid or missing contractId');
      onSignError(err);
      return;
    }

    if (!signTypedDataAsync) {
      const err = new Error('Signing function is not ready.');
      onSignError(err);
      return;
    }

    try {
      // 1. 백엔드에서 서명 데이터 가져오기
      console.log('[Eip712Signer] Fetching signature data...');
      const typedData = await getSignatureData(contractId);
      console.log('[Eip712Signer] Signature data received:', typedData);
      console.log('[Eip712Signer] Message content:', JSON.stringify(typedData.message, null, 2));

      // 2. 데이터 형식 변환
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { EIP712Domain, ...types } = typedData.types;

      // BigInt 변환이 필요한 필드만 변환 (필드가 존재하고 숫자 타입인 경우만)
      const messageForSigner: Record<string, any> = { ...typedData.message };

      // contractId 변환
      if (typedData.message.contractId !== undefined && typedData.message.contractId !== null) {
        messageForSigner.contractId = BigInt(typedData.message.contractId);
      }

      // totalAmount 변환 (문자열이나 숫자 모두 가능)
      if (typedData.message.totalAmount !== undefined && typedData.message.totalAmount !== null) {
        messageForSigner.totalAmount = BigInt(typedData.message.totalAmount);
      }

      console.log('[Eip712Signer] Converted message:', messageForSigner);

      // 데이터 준비 완료 콜백 호출
      if (onDataPrepared) {
        onDataPrepared();
      }

      // 3. 서명 요청
      console.log('[Eip712Signer] Calling signTypedDataAsync...');

      // 서명 시작 콜백 호출
      if (onSigningStarted) {
        onSigningStarted();
      }

      const signature = await signTypedDataAsync({
        domain: {
          ...typedData.domain,
          verifyingContract: typedData.domain.verifyingContract as `0x${string}`,
        },
        types: types,
        primaryType: typedData.primaryType,
        message: messageForSigner,
      });

      // 4. 서명 성공 시 콜백 호출
      console.log('[Eip712Signer] Signature received:', signature);
      onSignSuccess(signature);

    } catch (err: any) {
      const errorMessage = err.shortMessage || err.message || '알 수 없는 오류가 발생했습니다.';
      console.error('[Eip712Signer] Error:', err);

      if (err.response) {
        const apiErrorMessage = err.response?.data?.message || '서명 데이터를 가져오는 데 실패했습니다.';
        setApiError(apiErrorMessage);
        onSignError(new Error(apiErrorMessage));
      } else {
        onSignError(new Error(errorMessage));
      }
    }
  };

  const finalError = apiError || signErrorHook?.message;

  return (
    <div className="w-full">
      <button
        onClick={handleSignClick}
        disabled={isLoading || disabled}
        className={className || "flex-1 rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"}
      >
        {isLoading ? '지갑 확인 중...' : buttonText}
      </button>
      {finalError && (
        <p className="mt-2 text-sm text-moas-artist">오류: {finalError}</p>
      )}
    </div>
  );
}
