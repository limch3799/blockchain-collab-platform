// src/pages/admin/settlement/paymentStatus.ts
export const PAYMENT_TYPE = {
  PAYMENT: 'PAYMENT',
  FEE: 'FEE',
  SETTLEMENT: 'SETTLEMENT',
  REFUND: 'REFUND',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const ORDER_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  PARTIAL_CANCELED: 'PARTIAL_CANCELED',
} as const;

// 한글 매핑 (여기만 수정하면 전체 적용됨)
export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  PAYMENT: '결제',
  FEE: '수수료',
  SETTLEMENT: '정산',
  REFUND: '환불',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: '대기중',
  COMPLETED: '완료',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: '결제완료',
  PENDING: '대기중',
  CANCELLED: '취소됨',
  FAILED: '실패',
  PARTIAL_CANCELED: '부분취소',
};

// 유틸리티 함수
export const getPaymentTypeLabel = (type: string): string => {
  return PAYMENT_TYPE_LABELS[type] || type;
};

export const getPaymentStatusLabel = (status: string): string => {
  return PAYMENT_STATUS_LABELS[status] || status;
};

export const getOrderStatusLabel = (status: string): string => {
  return ORDER_STATUS_LABELS[status] || status;
};

// 배지 스타일
export const getPaymentTypeBadge = (type: string): string => {
  const styles: Record<string, string> = {
    PAYMENT: 'bg-blue-100 text-blue-700',
    FEE: 'bg-purple-100 text-purple-700',
    SETTLEMENT: 'bg-green-100 text-green-700',
    REFUND: 'bg-red-100 text-red-700',
  };
  return styles[type] || 'bg-gray-100 text-gray-700';
};

export const getPaymentStatusBadge = (status: string): string => {
  const styles: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'text-orange-600',
    COMPLETED: 'text-green-600',
  };
  return colors[status] || 'text-gray-600';
};