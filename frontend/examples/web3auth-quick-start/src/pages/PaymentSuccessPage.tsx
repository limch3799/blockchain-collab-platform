// src/pages/PaymentSuccessPage.tsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { PaymentApproveRequest } from '../types/api';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState('결제 승인 처리 중입니다. 잠시만 기다려주세요...');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const approvePayment = async () => {
      // 1. URL 쿼리 파라미터에서 결제 승인에 필요한 키들을 추출합니다.
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 승인에 필요한 정보가 누락되었습니다.');
        return;
      }

      try {
        // 2. 백엔드에 최종 결제 승인을 요청합니다.
        const requestBody: PaymentApproveRequest = {
          paymentKey,
          orderId,
          amount: Number(amount),
        };
        
        await apiClient.post('/payments/approve', requestBody);

        // 3. 최종 승인 성공 시 메시지를 변경하고, 몇 초 후 계약 상세 페이지로 이동시킵니다.
        setMessage('결제가 성공적으로 완료되었습니다! 잠시 후 계약 상세 페이지로 이동합니다.');
        
        // orderId에서 contractId를 추출 (예: "MOAS_ORD_105_...")
        const contractId = orderId.split('_')[2];
        setTimeout(() => {
          navigate(`/contract/${contractId}`);
        }, 3000); // 3초 후 이동

      } catch (err: any) {
        console.error("결제 승인 실패:", err);
        setError(err.response?.data?.message || '결제 최종 승인에 실패했습니다.');
      }
    };

    approvePayment();
  }, [searchParams, navigate]);

  return (
    <div className="wrapper w-100">
      {error ? (
        // --- 실패 시 UI ---
        <div className="flex-column align-center w-100 max-w-540">
          <img src="https://static.toss.im/lotties/error-spot-apng.png" width="120" height="120" alt="error"/>
          <h2 className="title">결제 승인 실패</h2>
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          {/* 다시 시도하거나 홈으로 돌아가는 버튼 등을 추가할 수 있습니다. */}
        </div>
      ) : (
        // --- 처리 중 또는 성공 시 UI ---
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
          <div className="flex-column align-center">
            <img src="https://static.toss.im/lotties/loading-spot-apng.png" width="120" height="120" alt="loading"/>
            <h2 className="title text-center">결제 처리 중</h2>
            <h4 className="text-center description">{message}</h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;