// // src/components/CheckoutWidget.tsx (새 파일 생성)

// import { useEffect, useRef, useState } from "react";
// import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
// import type { PaymentWidgetInstance } from "@tosspayments/widgets-sdk";

// // 부모 컴포넌트로부터 결제 정보를 받아올 Props 타입 정의
// interface CheckoutWidgetProps {
//   paymentInfo: {
//     orderId: string;
//     orderName: string;
//     customerName: string;
//     amount: number;
//   };
// }

// const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"; // 👈 테스트 클라이언트 키 (위젯용)

// const CheckoutWidget: React.FC<CheckoutWidgetProps> = ({ paymentInfo }) => {
//   const [widgets, setWidgets] = useState<PaymentWidgetInstance | null>(null);
//   const paymentMethodWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);

//   useEffect(() => {
//     // 1. 토스페이먼츠 객체 생성
//     const fetchPaymentWidgets = async () => {
//       const tossPayments = await loadTossPayments(clientKey);
//       const paymentWidgets = tossPayments.widgets({ customerKey: ANONYMOUS }); // ANONYMOUS는 비회원 유저를 의미
//       setWidgets(paymentWidgets);
//     };

//     fetchPaymentWidgets();
//   }, []);

//   useEffect(() => {
//     if (widgets == null) return;
    
//     // 2. 위젯에 결제 금액 설정 및 렌더링
//     const renderPaymentWidgets = async () => {
//       await widgets.setAmount({
//         currency: "KRW",
//         value: paymentInfo.amount,
//       });

//       const paymentMethodWidget = await widgets.renderPaymentMethods({
//         selector: "#payment-method",
//         variantKey: "DEFAULT",
//       });

//       await widgets.renderAgreement({
//         selector: "#agreement",
//         variantKey: "AGREEMENT",
//       });

//       paymentMethodWidgetRef.current = paymentMethodWidget;
//     };

//     renderPaymentWidgets();
//   }, [widgets, paymentInfo.amount]);

//   const handlePaymentRequest = async () => {
//     if (!widgets) return;

//     try {
//       // 3. 결제 요청
//       await widgets.requestPayment({
//         orderId: paymentInfo.orderId,
//         orderName: paymentInfo.orderName,
//         customerName: paymentInfo.customerName,
//         successUrl: `${window.location.origin}/payment-success`,
//         failUrl: `${window.location.origin}/payment-fail`,
//       });
//     } catch (error: any) {
//       // 에러 처리: 사용자가 결제창을 닫거나, 서버에서 에러가 발생했을 때
//       alert(error.message || '결제 처리 중 에러가 발생했습니다.');
//     }
//   };

//   return (
//     <div className="wrapper w-100">
//         <h2>결제 진행</h2>
//         <p>계약이 정상적으로 서명되었습니다. 결제를 진행해주세요.</p>
//         <div id="payment-method" className="w-100" />
//         <div id="agreement" className="w-100" />
//         <div className="btn-wrapper w-100" style={{marginTop: '20px'}}>
//             <button
//                 className="btn primary w-100"
//                 onClick={handlePaymentRequest}
//                 style={{
//                     backgroundColor: '#3182f6', color: 'white', padding: '15px', 
//                     border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer'
//                 }}
//             >
//                 {paymentInfo.amount.toLocaleString()}원 결제하기
//             </button>
//         </div>
//     </div>
//   );
// };

// export default CheckoutWidget;