/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOSS_CLIENT_KEY: string;
  readonly VITE_WEB3_AUTH_KEY: string;
  // 다른 환경 변수들...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Toss Payments SDK 타입 정의
interface TossPaymentsInstance {
  requestPayment: (method: string, options: {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    successUrl: string;
    failUrl: string;
  }) => void;
}

interface Window {
  TossPayments: (clientKey: string) => TossPaymentsInstance;
}
