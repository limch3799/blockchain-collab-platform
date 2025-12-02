/**
 * PaymentFailPage
 *
 * 토스페이먼츠 결제 실패 시 리다이렉트되는 페이지
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [failureMessage, setFailureMessage] = useState('');

  useEffect(() => {
    // URL 쿼리 파라미터에서 실패 정보 추출
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    console.error('[PaymentFail] Payment failed:', { code, message });
    setFailureMessage(message || '결제에 실패했습니다.');
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-moas-white font-pretendard">
      <div className="mx-4 w-full max-w-md">
        <div className="flex flex-col items-center space-y-6 rounded-3xl bg-white p-12 shadow-lg">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-moas-error-bg">
            <span className="text-6xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-moas-text">결제 실패</h2>
          <p className="text-center text-moas-artist">{failureMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border-2 border-moas-gray-2 bg-white px-8 py-3 font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
            >
              뒤로 가기
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-moas-main px-8 py-3 font-bold text-moas-text transition-opacity hover:opacity-90"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
