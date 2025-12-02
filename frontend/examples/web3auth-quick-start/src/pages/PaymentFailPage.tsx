// src/pages/PaymentFailPage.tsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  return (
    <div className="wrapper w-100">
      <div className="flex-column align-center w-100 max-w-540">
        <img src="https://static.toss.im/lotties/error-spot-apng.png" width="120" height="120" alt="error"/>
        <h2 className="title">결제를 실패했어요</h2>
        <div className="response-section w-100">
          <div className="flex justify-between">
            <span className="response-label">에러코드</span>
            <span className="response-text">{errorCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="response-label">에러메시지</span>
            <span className="response-text" style={{ textAlign: 'right' }}>{errorMessage}</span>
          </div>
          <div className="flex justify-between">
            <span className="response-label">주문번호</span>
            <span className="response-text">{orderId}</span>
          </div>
        </div>

        <div className="w-100 button-group">
          <Link to="/" className="btn w-100">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;