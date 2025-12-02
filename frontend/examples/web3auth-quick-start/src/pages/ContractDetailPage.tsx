// src/pages/ContractDetailPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { 
    ContractDetailResponse, 
    ContractFinalizeResponse
} from '../types/api';
import Eip712Signer from '../components/Eip712Signer';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
// import CheckoutWidget from '../components/CheckoutWidget';

// TODO: 실제 로그인 유저 정보를 가져오는 로직으로 교체
const useCurrentUser = () => ({
    id: 328, 
    role: 'ARTIST'
    // id: 1, 
    // role: 'ARTIST'
});

interface PaymentWidgetInfo {
  orderId: string;
  orderName: string;
  customerName: string;
  amount: number;
}

const ContractDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const currentUser = useCurrentUser();
    const tossClientKey = 'test_ck_GePWvyJnrKPJEW605QW18gLzN97E'; // 토스페이먼츠 테스트 클라이언트 키
    const [contractData, setContractData] = useState<ContractDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        const fetchContract = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get<ContractDetailResponse>(`/contracts/${id}`);
                setContractData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || '계약 정보를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchContract();
    }, [id]);

    const handleAcceptSuccess = useCallback(async (signature: `0x${string}`) => {
        if (!contractData) return;
        setIsSubmitting(true);
        try {
            await apiClient.post(`/contracts/${contractData.contractId}/accept`, {
                artistSignature: signature,
            });
            alert('계약 수락이 완료되었습니다.');
            window.location.reload(); 
        } catch (err: any) {
            alert(err.response?.data?.message || '계약 수락에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }, [contractData]);

    const handleFinalizeSuccess = useCallback(async (signature: `0x${string}`) => {
        if (!contractData) return;

        setIsSubmitting(true);
        try {
            const response = await apiClient.post<ContractFinalizeResponse>(
                `/contracts/${contractData.contractId}/finalize`,
                { leaderSignature: signature }
            );
            const finalizeData = response.data; 

            if (!finalizeData || !finalizeData.paymentInfo) {
                throw new Error("백엔드로부터 올바른 결제 정보를 받지 못했습니다.");
            }
            
            // --- 👇 '기존 결제창' 호출 로직 ---
            const tossPayments = window.TossPayments(tossClientKey);

            if (!tossPayments || typeof tossPayments.requestPayment !== 'function') {
                throw new Error('Toss Payments SDK가 제대로 로드되지 않았습니다.');
            }

            // 결제창을 직접 호출합니다.
            tossPayments.requestPayment('카드', {
                amount: finalizeData.paymentInfo.amount,
                orderId: finalizeData.paymentInfo.orderId,
                orderName: finalizeData.paymentInfo.productName,
                customerName: finalizeData.paymentInfo.customerName,
                successUrl: `${window.location.origin}/payment-success`,
                failUrl: `${window.location.origin}/payment-fail`,
            });
            // ------------------------------------

        } catch (err: any) {
            alert('계약 체결 또는 결제창 호출에 실패했습니다: ' + (err.message || ''));
        } finally {
            setIsSubmitting(false);
        }
    }, [contractData, tossClientKey]);

    const handleSignError = useCallback((err: Error) => {
        alert(`서명 오류: ${err.message}`);
    }, []);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div style={{ color: 'red' }}>오류: {error}</div>;
    if (!contractData) return <div>계약 정보를 찾을 수 없습니다.</div>;

    const isArtist = currentUser.role === 'ARTIST' && currentUser.id === contractData.artist.userId;
    const isLeader = currentUser.role === 'LEADER' && currentUser.id === contractData.leader.userId;

    return (
        <div style={{ padding: '20px' }}>
            <h1>계약 상세: {contractData?.title}</h1>
            <p><strong>상태:</strong> {contractData?.status}</p>
            <p><strong>금액:</strong> {contractData?.totalAmount.toLocaleString()}원</p>
            <hr />

            {isArtist && contractData?.status === 'PENDING' && (
                <div>
                    <h3>아티스트 서명</h3>
                    <Eip712Signer
                        contractId={contractData.contractId}
                        onSignSuccess={handleAcceptSuccess}
                        onSignError={handleSignError}
                        disabled={isSubmitting}
                        buttonText="동의 및 서명하기"
                    />
                </div>
            )}
            
            {isLeader && contractData?.status === 'ARTIST_SIGNED' && (
                <div>
                    <h3>리더 서명 및 결제</h3>
                    <Eip712Signer
                        contractId={contractData.contractId}
                        onSignSuccess={handleFinalizeSuccess}
                        onSignError={handleSignError}
                        disabled={isSubmitting}
                        buttonText="최종 서명 및 결제하기"
                    />
                </div>
            )}
        </div>
    );
};

export default ContractDetailPage;