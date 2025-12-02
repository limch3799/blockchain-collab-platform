// src/api/admin/settlement_history.ts
import api from './admin-axios';

export type PaymentType = 'PAYMENT' | 'FEE' | 'SETTLEMENT' | 'REFUND';
export type PaymentStatus = 'PENDING' | 'COMPLETED';

export interface PaymentItem {
  paymentId: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  createdAt: string;
  completedAt: string | null;
  primaryMemberId: number;
  orderId: string;
  contractId: number;
  orderStatus: string;
  payerMemberId: number;
}

export interface PaymentListResponse {
  content: PaymentItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface PaymentSearchParams {
  types?: string;
  statuses?: string;
  startDate?: string;
  endDate?: string;
  orderId?: string;
  contractId?: number;
  memberId?: number;
  page?: number;
  size?: number;
}

// 정산 내역 조회
export const getPaymentList = async (params: PaymentSearchParams) => {
  const response = await api.get<PaymentListResponse>('/payments', { params });
  return response.data;
};