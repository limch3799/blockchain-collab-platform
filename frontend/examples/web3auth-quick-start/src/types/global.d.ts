// src/types/global.d.ts
interface TossPayments {
  requestPayment: (
    paymentType: string, // '카드' 등
    paymentData: {
      amount: number;
      orderId: string;
      orderName: string;
      customerName: string;
      customerEmail?: string;
      successUrl: string;
      failUrl: string;
    }
  ) => void;
}

declare global {
  interface Window {
    TossPayments: (clientKey: string) => TossPayments;
  }
}

// 이 파일이 모듈로 인식되도록 export {} 추가
export {};