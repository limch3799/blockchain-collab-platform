/**
 * PaymentSuccessPage
 *
 * 토스페이먼츠 결제 성공 후 리다이렉트되는 페이지
 * - 결제 승인 API 호출
 * - 성공 시 계약 상세 페이지로 이동
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie-player';
import { approvePayment } from '@/api/contract';
import paymentLoaderAnimation from '@/assets/payment_loader.json';
import successAnimation from '@/assets/Success_Animation.json';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('결제 승인 처리 중입니다. 잠시만 기다려주세요...');
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // 중복 실행 방지를 위한 ref
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handlePaymentApproval = async () => {
      // 이미 처리 중이면 중복 실행 방지
      if (isProcessingRef.current) {
        console.log('[PaymentSuccess] Already processing, skipping duplicate request');
        return;
      }

      isProcessingRef.current = true;
      // 1. URL 쿼리 파라미터에서 결제 승인에 필요한 정보 추출
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 승인에 필요한 정보가 누락되었습니다.');
        isProcessingRef.current = false; // 파라미터 누락은 API 호출 전이므로 리셋
        return;
      }

      try {
        // 2. 백엔드에 최종 결제 승인 요청
        console.log('[PaymentSuccess] URL params:', { paymentKey, orderId, amount });
        console.log('[PaymentSuccess] Request body:', {
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        const response = await approvePayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        console.log('[PaymentSuccess] Approval response:', response);

        // 3. 성공 시 메시지 변경 및 성공 애니메이션 표시
        setMessage('결제가 성공적으로 완료되었습니다!');
        setPaymentConfirmed(true);

        // orderId에서 contractId 추출 (예: "MOAS_ORD_105_...")
        const contractId = orderId.split('_')[2];
        console.log('[PaymentSuccess] Extracted contractId:', contractId);

        // 성공 애니메이션 표시 후 계약 상세 페이지로 이동
        setTimeout(() => {
          navigate(`/contract/${contractId}`);
        }, 3000); // 3초 후 이동 (애니메이션 시간 고려)
      } catch (err: any) {
        console.error('[PaymentSuccess] Payment approval failed:', err);
        setError(err.response?.data?.message || '결제 최종 승인에 실패했습니다.');
      }
    };

    handlePaymentApproval();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center font-pretendard">
      <div className="mx-4 w-full max-w-md">
        {error ? (
          // 실패 시 UI
          <div className="flex flex-col items-center space-y-6 rounded-3xl bg-white p-12 shadow-lg mt-8 mb-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-moas-error-bg">
              <span className="text-6xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-moas-text">결제 승인 실패</h2>
            <p className="text-center text-moas-artist">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-moas-main px-8 py-3 font-bold text-moas-text transition-opacity hover:opacity-90"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : paymentConfirmed ? (
          // 결제 성공 시 UI
          <div className="flex flex-col items-center space-y-6 rounded-3xl bg-white p-12 shadow-lg mt-8 mb-4">
            <div className="overflow-hidden mb-0" style={{ width: 200, height: 200 }}>
              <div style={{ transform: 'translateY(-34px) translateX(-30px)' }}>
                <Lottie
                  loop={false}
                  animationData={successAnimation}
                  play
                  style={{ width: 250, height: 250 }}
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-moas-text">결제 완료!</h2>
            <p className="text-center text-moas-gray-7">{message}</p>
          </div>
        ) : (
          // 처리 중 UI
          <div className="flex flex-col items-center space-y-6 rounded-3xl bg-white p-12 shadow-lg">
            <Lottie
              loop={true}
              animationData={paymentLoaderAnimation}
              play
              style={{ width: 200, height: 200 }}
            />
            <h2 className="text-2xl font-bold text-moas-text">결제 처리 중</h2>
            <p className="text-center text-moas-gray-7">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
